import { indexPDF } from "@/lib/embedding.js";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Ensure uploads directory exists
async function ensureUploadsDir() {
  const uploadsDir = path.join(process.cwd(), "uploads");
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }
  return uploadsDir;
}

export async function POST(req) {
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
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadsDir, fileName);
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await fs.writeFile(filePath, buffer);

    // Index the PDF
    const namespace = fileName.replace(".pdf", "");
    await indexPDF(filePath, namespace);

    // Clean up the file after processing
    await fs.unlink(filePath);

    return NextResponse.json({ 
      success: true, 
      message: "PDF uploaded and indexed successfully",
      namespace 
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process PDF" },
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