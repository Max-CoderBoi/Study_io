import { NextResponse } from "next/server";
import { askQuestion } from "@/lib/rag";

export async function POST(request) {
  try {
    const body = await request.json();
    const { question } = body;

    console.log('💬 Chat API received question:', question);

    if (!question) {
      return NextResponse.json(
        { answer: "Please provide a question." },
        { status: 400 }
      );
    }

    // Use the namespace from your uploaded PDF
    // Replace this with the actual namespace from your upload
    const namespace = "1763901349048-Dsa"; // Use your actual PDF namespace
    
    // Get answer from RAG system
    const answer = await askQuestion(question, namespace);

    console.log('✅ Chat API returning answer');
    return NextResponse.json({ answer });

  } catch (error) {
    console.error("❌ Chat API error:", error);
    return NextResponse.json(
      { answer: "Sorry, I encountered an error processing your question. Please try again." },
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