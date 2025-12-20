import { indexPDF } from "@/lib/embedding.js";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

async function ensureUploadsDir() {
  const uploadsDir = path.join(process.cwd(), "uploads");
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }
  return uploadsDir;
}

// Sanitize filename to remove special characters
function sanitizeFilename(filename) {
  return filename
    .replace(/[()[\]{}]/g, '') // Remove parentheses and brackets
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-zA-Z0-9.-]/g, ''); // Remove other special chars
}

export async function POST(req) {
  let filePath = null;
  
  try {
    const form = await req.formData();
    const file = form.get("pdf");

    if (!file) {
      return NextResponse.json(
        { error: "No PDF file provided" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    const uploadsDir = await ensureUploadsDir();
    
    // Sanitize the filename
    const originalName = file.name;
    const sanitizedName = sanitizeFilename(originalName);
    const fileName = `${Date.now()}-${sanitizedName}`;
    
    filePath = path.join(uploadsDir, fileName);
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await fs.writeFile(filePath, buffer);
    console.log("✓ File saved:", filePath);

    // Index the PDF
    const namespace = fileName.replace(".pdf", "");
    const result = await indexPDF(filePath, namespace);

    // Clean up the file after processing
    try {
      await fs.unlink(filePath);
      console.log("✓ File cleaned up");
    } catch (err) {
      console.warn("Warning: Could not delete file:", err.message);
    }

    return NextResponse.json({ 
      success: true, 
      message: "PDF uploaded and indexed successfully",
      namespace: namespace,
      chunks: result.chunks,
      originalName: originalName // Send back original name for display
    });

  } catch (error) {
    console.error("❌ Upload error:", error);
    
    // Try to clean up file if it exists
    if (filePath) {
      try {
        await fs.unlink(filePath);
      } catch {}
    }
    
    return NextResponse.json(
      { 
        error: "Failed to process PDF",
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}