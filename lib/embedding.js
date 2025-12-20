import fs from "fs/promises";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Pinecone } from "@pinecone-database/pinecone";
import { VoyageEmbeddings } from "@langchain/community/embeddings/voyage";

export async function indexPDF(filePath, namespace) {
  try {
    console.log("Processing PDF:", filePath, "→ Namespace:", namespace);
    
    // Validate file exists
    try {
      await fs.access(filePath);
    } catch {
      throw new Error("PDF file not found");
    }

    const loader = new PDFLoader(filePath, {
      splitPages: true,
    });
    
    const rawDocs = await loader.load();
    console.log(`Loaded ${rawDocs.length} pages`);

    if (rawDocs.length === 0) {
      throw new Error("No content found in PDF");
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await splitter.splitDocuments(rawDocs);
    console.log(`Split into ${chunks.length} chunks`);

    // Validate environment variables
    if (!process.env.VOYAGE_API_KEY) {
      throw new Error("VOYAGE_API_KEY not configured. Get it from dash.voyageai.com");
    }
    if (!process.env.PINECONE_API_KEY) {
      throw new Error("PINECONE_API_KEY not configured");
    }
    if (!process.env.PINECONE_INDEX_NAME) {
      throw new Error("PINECONE_INDEX_NAME not configured");
    }

    // Use Voyage AI embeddings
    const embeddings = new VoyageEmbeddings({
      apiKey: process.env.VOYAGE_API_KEY,
      modelName: "voyage-2", // or "voyage-large-2-instruct" for better quality
    });

    const pinecone = new Pinecone({ 
      apiKey: process.env.PINECONE_API_KEY 
    });
    
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    // Test Pinecone connection
    try {
      await index.describeIndexStats();
    } catch (error) {
      throw new Error(`Pinecone connection failed: ${error.message}`);
    }

    // Embed and store documents in batches
    console.log('📦 Embedding and storing chunks...');
    
    const batchSize = 10; // Process 10 chunks at a time
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const texts = batch.map(doc => doc.pageContent);
      
      // Generate embeddings for batch
      const vectors = await embeddings.embedDocuments(texts);
      
      // Prepare records for Pinecone
      const records = batch.map((doc, idx) => ({
        id: `${namespace}-${i + idx}`,
        values: vectors[idx],
        metadata: {
          text: doc.pageContent,
          page: doc.metadata.loc?.pageNumber || 0,
        }
      }));
      
      // Upsert to Pinecone
      await index.namespace(namespace).upsert(records);
      console.log(`✓ Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)} stored`);
    }

    console.log("✅ PDF indexed successfully →", namespace);
    return { success: true, chunks: chunks.length };

  } catch (error) {
    console.error("❌ PDF indexing failed:", error);
    throw error;
  }
}