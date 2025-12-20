import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { VoyageEmbeddings } from "@langchain/community/embeddings/voyage";

// Initialize Grok using OpenAI SDK (Grok is compatible with OpenAI API)
const grok = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1',
});

export async function askQuestion(question, namespace = "default") {
  try {
    console.log('🔍 Asking question:', question, 'in namespace:', namespace);
    
    // Validate inputs
    if (!question?.trim()) {
      throw new Error("Question is required");
    }

    // Validate environment variables
    if (!process.env.XAI_API_KEY) {
      throw new Error("XAI_API_KEY not configured. Get it from console.x.ai");
    }
    if (!process.env.VOYAGE_API_KEY) {
      throw new Error("VOYAGE_API_KEY not configured. Get it from dash.voyageai.com");
    }
    if (!process.env.PINECONE_API_KEY) {
      throw new Error("PINECONE_API_KEY not configured");
    }
    if (!process.env.PINECONE_INDEX_NAME) {
      throw new Error("PINECONE_INDEX_NAME not configured");
    }

    console.log('📡 Initializing embeddings...');
    const embeddings = new VoyageEmbeddings({
      apiKey: process.env.VOYAGE_API_KEY,
      modelName: "voyage-2", // or "voyage-large-2" for better quality
    });

    // Generate query embedding
    console.log('🎯 Generating query embedding...');
    const queryVector = await embeddings.embedQuery(question);
    console.log('✅ Query embedding generated, length:', queryVector.length);

    // Query Pinecone
    console.log('🌲 Querying Pinecone...');
    const pinecone = new Pinecone({ 
      apiKey: process.env.PINECONE_API_KEY 
    });
    
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    const results = await index.namespace(namespace).query({
      topK: 5,
      vector: queryVector,
      includeMetadata: true,
    });

    console.log('📊 Pinecone results:', results.matches?.length || 0, 'matches found');

    if (!results.matches || results.matches.length === 0) {
      return "I couldn't find relevant information about this topic in your uploaded documents. Please make sure you've uploaded the relevant PDF files.";
    }

    // Build context from relevant chunks
    const context = results.matches
      .filter(match => match.score > 0.7)
      .map(match => match.metadata?.text || "")
      .filter(text => text.trim().length > 0)
      .join("\n\n---\n\n");

    console.log('📝 Context length:', context.length, 'characters');

    if (!context.trim()) {
      return "I found some information, but it doesn't seem relevant enough to provide a confident answer. Please try rephrasing your question or upload more relevant materials.";
    }

    // Generate response using Grok
    console.log('🤖 Generating response with Grok...');
    const completion = await grok.chat.completions.create({
      model: "grok-2-latest", // Use grok-2-latest or grok-beta
      temperature: 0.3,
      messages: [{
        role: "system",
        content: `You are a helpful study assistant. Answer the user's question based ONLY on the context provided from their uploaded study materials.

IMPORTANT INSTRUCTIONS:
1. Answer using ONLY the information from the context above
2. If the context doesn't contain enough information to answer fully, say what you can based on the context and mention what's missing
3. Keep your answer clear, concise, and educational
4. Do not make up information or use external knowledge
5. Format your answer with clear paragraphs and bullet points if helpful
6. Be direct and helpful`
      }, {
        role: "user",
        content: `CONTEXT FROM UPLOADED DOCUMENTS:
${context}

USER'S QUESTION: ${question}

Please provide your answer now:`
      }]
    });
    
    const answer = completion.choices[0].message.content;
    console.log('✅ Response generated successfully');
    return answer;

  } catch (error) {
    console.error('❌ RAG error:', error);
    
    // More specific error messages
    if (error.message.includes("API_KEY") || error.message.includes("configured")) {
      return "The AI service is currently unavailable due to configuration issues. Please check your API keys in environment variables.";
    }
    
    if (error.message.includes("Pinecone") || error.message.includes("index")) {
      return "I'm having trouble accessing the knowledge base. Please check that PINECONE_API_KEY and PINECONE_INDEX_NAME are set correctly, and that your PDF was properly uploaded.";
    }
    
    if (error.message.includes("quota") || error.message.includes("limit")) {
      return "The AI service quota has been exceeded. Please check your xAI API quota or try again later.";
    }
    
    if (error.message.includes("401") || error.message.includes("unauthorized")) {
      return "Invalid API key. Please check your XAI_API_KEY from console.x.ai";
    }
    
    return `Sorry, I encountered an error while processing your question: ${error.message}. Please try again or check the server logs for more details.`;
  }
}