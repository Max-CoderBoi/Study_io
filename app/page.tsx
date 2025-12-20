"use client";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [msgs, setMsgs] = useState([]);
  const [txt, setTxt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [msgs]);

  async function ask() {
    if (!txt.trim() || isLoading) return;

    const userMessage = { q: txt, type: "user" };
    setMsgs(prev => [...prev, userMessage]);
    setTxt("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: txt }),
      });

      const data = await res.json();
      setMsgs(prev => [...prev, { q: txt, a: data.answer, type: "assistant" }]);
    } catch (error) {
      setMsgs(prev => [...prev, { 
        q: txt, 
        a: "Sorry, I encountered an error. Please try again.", 
        type: "assistant",
        isError: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  const uploadPDF = async (file) => {
    if (!file) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await fetch("/api/upload-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      // Show success message in chat
      setMsgs(prev => [...prev, {
        q: `Uploaded PDF: ${file.name}`,
        a: `✅ PDF uploaded and indexed successfully! You can now ask questions about "${file.name.replace('.pdf', '')}".`,
        type: "assistant",
        isSuccess: true
      }]);

      return data;
    } catch (error) {
      setMsgs(prev => [...prev, {
        q: `Upload PDF: ${file.name}`,
        a: `❌ Upload failed: ${error.message}`,
        type: "assistant",
        isError: true
      }]);
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center p-4 md:p-6">
      {/* Header */}
      <div className="w-full max-w-2xl text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">📚</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Study.io
          </h1>
        </div>
        <p className="text-gray-600 text-sm md:text-base">
          Your AI study assistant - Upload PDFs and ask questions!
        </p>
      </div>

      {/* PDF Upload Section */}
      <div className="w-full max-w-2xl mb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Upload Study Materials
              </h3>
              <p className="text-sm text-gray-600">
                Upload PDFs to build your knowledge base
              </p>
            </div>
            <label className="relative cursor-pointer">
              <input
                type="file"
                accept=".pdf"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) await uploadPDF(file);
                  e.target.value = ""; // Reset input
                }}
                disabled={isUploading}
                className="hidden"
              />
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                isUploading 
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                  : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-sm"
              }`}>
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Upload PDF</span>
                  </>
                )}
              </div>
            </label>
          </div>
          
          {/* Upload Tips */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Supports lecture notes, textbooks, articles</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>AI will answer from uploaded content</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white/80 backdrop-blur-sm w-full max-w-2xl rounded-2xl shadow-xl border border-white/20 flex flex-col h-[500px] md:h-[600px]">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {msgs.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Welcome to Study.io!
              </h3>
              <p className="text-sm max-w-md mx-auto mb-4">
                Upload your study PDFs above, then ask questions about the content.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                <h4 className="font-medium text-blue-800 mb-2">Try asking:</h4>
                <div className="space-y-1 text-sm text-blue-700">
                  <p>• "Explain the main concepts from the PDF"</p>
                  <p>• "Summarize chapter 3"</p>
                  <p>• "What are the key points about..."</p>
                </div>
              </div>
            </div>
          ) : (
            msgs.map((m, i) => (
              <div key={i} className={`flex ${m.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                    m.type === "user"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none"
                      : m.isError
                      ? "bg-red-50 border border-red-200 text-red-800 rounded-bl-none"
                      : m.isSuccess
                      ? "bg-green-50 border border-green-200 text-green-800 rounded-bl-none"
                      : "bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {m.type === "user" ? (
                    <p className="text-white">{m.q}</p>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${
                          m.isError ? "bg-red-500" : 
                          m.isSuccess ? "bg-green-500" : 
                          "bg-green-500"
                        }`}></div>
                        <span className="text-xs font-medium">
                          {m.isError ? "Error" : m.isSuccess ? "Success" : "Study Assistant"}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{m.a}</p>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl rounded-bl-none p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium">Study Assistant</span>
                </div>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200/50 p-4 md:p-6 bg-white/50">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                className="w-full border border-gray-300 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 shadow-sm transition-all duration-200"
                placeholder="Ask anything about your uploaded documents..."
                value={txt}
                onChange={e => setTxt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && ask()}
                disabled={isLoading}
              />
              <button
                onClick={ask}
                disabled={!txt.trim() || isLoading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
                  />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">
            Press Enter to send • AI answers from your uploaded content
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-2xl w-full">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 shadow-sm">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <span className="text-blue-600">📄</span>
          </div>
          <h3 className="font-semibold text-gray-800 text-sm">PDF Upload</h3>
          <p className="text-xs text-gray-600">Upload study materials</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 shadow-sm">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <span className="text-green-600">🎯</span>
          </div>
          <h3 className="font-semibold text-gray-800 text-sm">Smart Answers</h3>
          <p className="text-xs text-gray-600">Context-aware responses</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 shadow-sm">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <span className="text-purple-600">⚡</span>
          </div>
          <h3 className="font-semibold text-gray-800 text-sm">Instant</h3>
          <p className="text-xs text-gray-600">Quick study help</p>
        </div>
      </div>
    </main>
  );
}