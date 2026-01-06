import fs from "fs/promises";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Pinecone } from "@pinecone-database/pinecone";
import { VoyageEmbeddings } from "@langchain/community/embeddings/voyage";

// Configuration constants
const CONFIG = {
  CHUNK_SIZE: 1000,
  CHUNK_OVERLAP: 200,
  BATCH_SIZE: 10,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  RATE_LIMIT_DELAY: 100,
};

// Custom error classes
class PDFIndexError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "PDFIndexError";
    this.code = code;
  }
}

// Validation utilities
function validateEnvironment() {
  const required = [
    "VOYAGE_API_KEY",
    "PINECONE_API_KEY",
    "PINECONE_INDEX_NAME",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new PDFIndexError(
      `Missing environment variables: ${missing.join(", ")}`,
      "ENV_MISSING"
    );
  }
}

async function validateFile(filePath) {
  try {
    const stats = await fs.stat(filePath);
    if (!stats.isFile()) {
      throw new PDFIndexError(`Path is not a file: ${filePath}`, "NOT_FILE");
    }
    if (stats.size === 0) {
      throw new PDFIndexError(`File is empty: ${filePath}`, "EMPTY_FILE");
    }
    console.log(`✓ File validated (${(stats.size / 1024).toFixed(2)} KB)`);
    return stats;
  } catch (error) {
    if (error instanceof PDFIndexError) throw error;
    throw new PDFIndexError(`File not found: ${filePath}`, "FILE_NOT_FOUND");
  }
}

// Retry logic for API calls
async function retryOperation(operation, operationName, maxRetries = CONFIG.MAX_RETRIES) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(
        `  ⚠️ ${operationName} failed (attempt ${attempt}/${maxRetries}):`,
        error.message
      );
      
      if (attempt < maxRetries) {
        const delay = CONFIG.RETRY_DELAY * attempt;
        console.log(`  ⏳ Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new PDFIndexError(
    `${operationName} failed after ${maxRetries} attempts: ${lastError.message}`,
    "RETRY_EXHAUSTED"
  );
}

// Progress tracking
class ProgressTracker {
  constructor(total) {
    this.total = total;
    this.processed = 0;
    this.startTime = Date.now();
  }

  update(count = 1) {
    this.processed += count;
  }

  getStats() {
    const elapsed = (Date.now() - this.startTime) / 1000;
    const rate = this.processed / elapsed;
    const remaining = this.total - this.processed;
    const eta = remaining / rate;

    return {
      processed: this.processed,
      total: this.total,
      percentage: ((this.processed / this.total) * 100).toFixed(1),
      elapsed: elapsed.toFixed(1),
      rate: rate.toFixed(2),
      eta: eta.toFixed(1),
    };
  }

  logProgress() {
    const stats = this.getStats();
    console.log(
      `  📊 Progress: ${stats.processed}/${stats.total} (${stats.percentage}%) | ` +
      `Rate: ${stats.rate} chunks/s | ETA: ${stats.eta}s`
    );
  }
}

// Main indexing function
export async function indexPDF(filePath, namespace, options = {}) {
  const config = { ...CONFIG, ...options };
  
  try {
    console.log("📄 Processing PDF:", filePath, "→ Namespace:", namespace);
    console.log("⚙️ Configuration:", config);

    // Validate environment and file
    validateEnvironment();
    await validateFile(filePath);

    // Load PDF
    console.log("📖 Loading PDF...");
    const loader = new PDFLoader(filePath, {
      splitPages: true,
      parsedItemSeparator: " ",
    });

    const rawDocs = await retryOperation(
      () => loader.load(),
      "PDF loading"
    );
    console.log(`✓ Loaded ${rawDocs.length} pages`);

    if (rawDocs.length === 0) {
      throw new PDFIndexError("No content found in PDF", "EMPTY_PDF");
    }

    // Split into chunks
    console.log("✂️ Splitting into chunks...");
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: config.CHUNK_SIZE,
      chunkOverlap: config.CHUNK_OVERLAP,
      separators: ["\n\n", "\n", " ", ""],
    });

    const chunks = await splitter.splitDocuments(rawDocs);
    console.log(`✓ Split into ${chunks.length} chunks`);

    // Initialize services
    console.log("🚀 Initializing services...");
    const embeddings = new VoyageEmbeddings({
      apiKey: process.env.VOYAGE_API_KEY,
      modelName: "voyage-2",
    });

    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    // Test connection
    await retryOperation(
      () => index.describeIndexStats(),
      "Pinecone connection"
    );
    console.log("✓ Services initialized");

    // Process in batches with progress tracking
    console.log("📦 Embedding and storing chunks...");
    const progress = new ProgressTracker(chunks.length);

    for (let i = 0; i < chunks.length; i += config.BATCH_SIZE) {
      const batch = chunks.slice(i, i + config.BATCH_SIZE);
      const batchNum = Math.floor(i / config.BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(chunks.length / config.BATCH_SIZE);

      console.log(`\n  📦 Batch ${batchNum}/${totalBatches}:`);

      const texts = batch.map((doc) => doc.pageContent);

      // Generate embeddings with retry
      const vectors = await retryOperation(
        () => embeddings.embedDocuments(texts),
        `Embedding batch ${batchNum}`
      );

      // Prepare records
      const records = batch.map((doc, idx) => ({
        id: `${namespace}-chunk-${i + idx}-${Date.now()}`,
        values: vectors[idx],
        metadata: {
          text: doc.pageContent,
          page: doc.metadata.loc?.pageNumber || 0,
          namespace: namespace,
          indexed_at: new Date().toISOString(),
          chunk_index: i + idx,
        },
      }));

      // Upsert with retry
      await retryOperation(
        () => index.namespace(namespace).upsert(records),
        `Upserting batch ${batchNum}`
      );

      progress.update(records.length);
      console.log(`  ✓ Batch ${batchNum} stored`);
      progress.logProgress();

      // Rate limiting
      if (i + config.BATCH_SIZE < chunks.length) {
        await new Promise((resolve) =>
          setTimeout(resolve, config.RATE_LIMIT_DELAY)
        );
      }
    }

    const finalStats = progress.getStats();
    console.log("\n✅ PDF indexed successfully!");
    console.log(`   Namespace: ${namespace}`);
    console.log(`   Total chunks: ${chunks.length}`);
    console.log(`   Total time: ${finalStats.elapsed}s`);
    console.log(`   Average rate: ${finalStats.rate} chunks/s`);

    return {
      success: true,
      chunks: chunks.length,
      namespace: namespace,
      stats: finalStats,
    };
  } catch (error) {
    console.error("\n❌ PDF indexing failed:", error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    throw error;
  }
}

// Utility function to index multiple PDFs
export async function indexMultiplePDFs(files, baseNamespace) {
  const results = [];
  
  for (let i = 0; i < files.length; i++) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Processing file ${i + 1}/${files.length}: ${files[i]}`);
    console.log("=".repeat(60));
    
    try {
      const namespace = `${baseNamespace}-file${i + 1}`;
      const result = await indexPDF(files[i], namespace);
      results.push({ file: files[i], ...result });
    } catch (error) {
      results.push({ file: files[i], success: false, error: error.message });
    }
  }
  
  return results;
}