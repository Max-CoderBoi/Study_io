"use client";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [msgs, setMsgs] = useState([]);
  const [txt, setTxt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentNamespace, setCurrentNamespace] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [msgs]);

  async function ask() {
    if (!txt.trim() || isLoading) return;

    // Check if a PDF is uploaded
    if (!currentNamespace) {
      setMsgs(prev => [...prev, {
        q: txt,
        a: "⚠️ Please upload a PDF first before asking questions!",
        type: "assistant",
        isError: true
      }]);
      setTxt("");
      return;
    }

    const userMessage = { q: txt, type: "user" };
    setMsgs(prev => [...prev, userMessage]);
    const currentQuestion = txt;
    setTxt("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          question: currentQuestion,
          namespace: currentNamespace // Send the namespace!
        }),
      });

      const data = await res.json();
      setMsgs(prev => [...prev, { 
        q: currentQuestion, 
        a: data.answer, 
        type: "assistant" 
      }]);
    } catch (error) {
      setMsgs(prev => [...prev, { 
        q: currentQuestion, 
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

    // Save the namespace
    setCurrentNamespace(data.namespace);
    
    // Add to uploaded files list - use originalName if available
    const displayName = data.originalName || file.name;
    setUploadedFiles(prev => [...prev, {
      name: displayName,
      namespace: data.namespace,
      uploadedAt: new Date().toLocaleTimeString()
    }]);

    // Show success message in chat
    setMsgs(prev => [...prev, {
      q: `Uploaded PDF: ${displayName}`,
      a: `✅ PDF uploaded and indexed successfully! (${data.chunks} chunks)\n\nYou can now ask questions about "${displayName.replace('.pdf', '')}".`,
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

  const clearChat = () => {
    setMsgs([]);
  };

  const switchDocument = (namespace, fileName) => {
    setCurrentNamespace(namespace);
    setMsgs(prev => [...prev, {
      q: "",
      a: `📄 Switched to "${fileName}". Ask me anything about this document!`,
      type: "assistant",
      isSuccess: true
    }]);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center p-4 md:p-6">
      {/* Header */}
      <div className="w-full max-w-4xl text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
            <span className="text-white font-bold text-2xl">📚</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Study.io
          </h1>
        </div>
        <p className="text-gray-600 text-base md:text-lg">
          Your AI-powered study companion • Upload PDFs and get instant answers
        </p>
      </div>

      <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Uploaded Documents */}
        {uploadedFiles.length > 0 && (
          <div className="lg:w-64 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 h-fit">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 text-sm">Documents</h3>
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                {uploadedFiles.length}
              </span>
            </div>
            <div className="space-y-2">
              {uploadedFiles.map((file, idx) => (
                <button
                  key={idx}
                  onClick={() => switchDocument(file.namespace, file.name)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    currentNamespace === file.namespace
                      ? "bg-blue-50 border-2 border-blue-400"
                      : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">📄</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">
                        {file.name.replace('.pdf', '')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {file.uploadedAt}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6">
          {/* PDF Upload Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  📚 Upload Study Materials
                </h3>
                <p className="text-sm text-gray-600">
                  {currentNamespace 
                    ? `Current: ${uploadedFiles[uploadedFiles.length - 1]?.name || 'Document'}`
                    : 'Upload PDFs to build your knowledge base'
                  }
                </p>
              </div>
              <label className="relative cursor-pointer">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) await uploadPDF(file);
                    e.target.value = "";
                  }}
                  disabled={isUploading}
                  className="hidden"
                />
                <div className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isUploading 
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                    : "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:shadow-lg hover:scale-105 shadow-md"
                }`}>
                  {isUploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
          </div>

          {/* Chat Container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 flex flex-col h-[500px] md:h-[600px]">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">AI Assistant</span>
              </div>
              {msgs.length > 0 && (
                <button
                  onClick={clearChat}
                  className="text-xs text-gray-500 hover:text-red-500 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Clear Chat
                </button>
              )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {msgs.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <span className="text-3xl">💬</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Welcome to Study.io!
                  </h3>
                  <p className="text-sm max-w-md mx-auto mb-6 text-gray-600">
                    Upload your study PDFs above, then ask questions about the content.
                  </p>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 max-w-md mx-auto border border-blue-100">
                    <h4 className="font-semibold text-gray-800 mb-3">✨ Try asking:</h4>
                    <div className="space-y-2 text-sm text-left">
                      <div className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        <p className="text-gray-700">"Summarize the main concepts"</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-purple-500">•</span>
                        <p className="text-gray-700">"Explain chapter 3 in simple terms"</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-pink-500">•</span>
                        <p className="text-gray-700">"What are the key takeaways?"</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                msgs.map((m, i) => (
                  <div key={i} className={`flex ${m.type === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}>
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                        m.type === "user"
                          ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-br-none"
                          : m.isError
                          ? "bg-red-50 border-2 border-red-200 text-red-800 rounded-bl-none"
                          : m.isSuccess
                          ? "bg-green-50 border-2 border-green-200 text-green-800 rounded-bl-none"
                          : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      {m.type === "user" ? (
                        <p className="text-white font-medium">{m.q}</p>
                      ) : (
                        <>
                          {!m.q && (
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-2 h-2 rounded-full ${
                                m.isError ? "bg-red-500" : 
                                m.isSuccess ? "bg-green-500" : 
                                "bg-blue-500"
                              }`}></div>
                              <span className="text-xs font-semibold">
                                {m.isError ? "Error" : m.isSuccess ? "Success" : "AI Assistant"}
                              </span>
                            </div>
                          )}
                          <p className="whitespace-pre-wrap leading-relaxed">{m.a}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
              
              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="max-w-[85%] bg-white border border-gray-200 rounded-2xl rounded-bl-none p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs font-semibold">AI Assistant</span>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2.5 h-2.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200/50 p-4 md:p-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    className="w-full border-2 border-gray-300 rounded-2xl px-5 py-3 pr-14 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 placeholder:text-gray-400"
                    placeholder={currentNamespace ? "Ask anything about your document..." : "Upload a PDF first to start chatting..."}
                    value={txt}
                    onChange={e => setTxt(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && ask()}
                    disabled={isLoading}
                  />
                  <button
                    onClick={ask}
                    disabled={!txt.trim() || isLoading}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white p-2.5 rounded-xl hover:shadow-lg disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
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
              <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-0.5 bg-gray-200 rounded text-xs">Enter</kbd>
                  to send
                </span>
                <span>•</span>
                <span>Powered by Grok AI + Voyage</span>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 text-center border border-white/40 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="font-bold text-gray-800 text-sm mb-1">PDF Upload</h3>
              <p className="text-xs text-gray-600">Upload any study material</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 text-center border border-white/40 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-bold text-gray-800 text-sm mb-1">Smart Answers</h3>
              <p className="text-xs text-gray-600">Context-aware responses</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 text-center border border-white/40 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-bold text-gray-800 text-sm mb-1">Instant Results</h3>
              <p className="text-xs text-gray-600">Quick study help</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}