import { NextResponse } from "next/server";
import { askQuestion } from "@/lib/rag";

export async function POST(request) {
  try {
    const body = await request.json();
    const { question, namespace } = body;

    console.log('💬 Chat API received question:', question);
    console.log('📂 Received namespace:', namespace);

    if (!question) {
      return NextResponse.json(
        { answer: "Please provide a question." },
        { status: 400 }
      );
    }

    // Use the namespace from the request body
    const ns = namespace || "1766264062684-Akash_final_resume";
    console.log('📂 Using namespace:', ns);
    
    // Get answer from RAG system
    const answer = await askQuestion(question, ns);

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