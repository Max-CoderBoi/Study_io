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
          namespace: currentNamespace
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

      setCurrentNamespace(data.namespace);
      
      const displayName = data.originalName || file.name;
      setUploadedFiles(prev => [...prev, {
        name: displayName,
        namespace: data.namespace,
        uploadedAt: new Date().toLocaleTimeString()
      }]);

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
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center p-4 md:p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="w-full max-w-6xl text-center mb-8 relative z-10">
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-75 animate-pulse"></div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300">
              <span className="text-3xl">📚</span>
            </div>
          </div>
          <div>
            <h1 className="text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
              Study.io
            </h1>
            <p className="text-purple-300 text-sm font-medium mt-1">AI-Powered Learning Assistant</p>
          </div>
        </div>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Upload your study materials and get instant, intelligent answers powered by advanced AI
        </p>
      </div>

      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6 relative z-10">
        {/* Sidebar */}
        {uploadedFiles.length > 0 && (
          <div className="lg:w-72 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <span className="text-xl">📁</span>
                Documents
              </h3>
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
                {uploadedFiles.length}
              </span>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {uploadedFiles.map((file, idx) => (
                <button
                  key={idx}
                  onClick={() => switchDocument(file.namespace, file.name)}
                  className={`w-full text-left p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    currentNamespace === file.namespace
                      ? "bg-gradient-to-r from-blue-500/30 to-purple-500/30 border-2 border-blue-400 shadow-lg"
                      : "bg-white/5 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📄</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {file.name.replace('.pdf', '')}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <span>🕐</span>
                        {file.uploadedAt}
                      </p>
                    </div>
                    {currentNamespace === file.namespace && (
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Upload Section */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <span>📚</span>
                  Upload Study Materials
                </h3>
                <p className="text-gray-300 text-sm">
                  {currentNamespace 
                    ? `📖 Current: ${uploadedFiles[uploadedFiles.length - 1]?.name || 'Document'}`
                    : 'Drop your PDFs here to unlock AI-powered insights'
                  }
                </p>
              </div>
              <label className="relative cursor-pointer group">
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
                <div className={`relative px-8 py-4 rounded-2xl font-bold transition-all duration-300 ${
                  isUploading 
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed" 
                    : "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:shadow-2xl hover:scale-110 shadow-xl transform"
                }`}>
                  <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {isUploading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>Upload PDF</span>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Chat Container */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 flex flex-col h-[600px] md:h-[700px] overflow-hidden">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-xl">🤖</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
                </div>
                <div>
                  <span className="text-white font-bold text-lg">AI Assistant</span>
                  <p className="text-xs text-gray-400">Always here to help</p>
                </div>
              </div>
              {msgs.length > 0 && (
                <button
                  onClick={clearChat}
                  className="text-sm text-gray-300 hover:text-red-400 px-4 py-2 rounded-xl hover:bg-red-500/10 transition-all duration-200 border border-white/10"
                >
                  Clear Chat
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {msgs.length === 0 ? (
                <div className="text-center text-gray-300 mt-16">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-50"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center shadow-2xl border border-white/20">
                      <span className="text-5xl">💬</span>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-3">
                    Welcome to Study.io
                  </h3>
                  <p className="text-lg max-w-md mx-auto mb-8 text-gray-400">
                    Upload your study materials and start learning smarter, not harder
                  </p>
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-8 max-w-lg mx-auto border border-white/10 backdrop-blur-sm">
                    <h4 className="font-bold text-white mb-5 text-xl flex items-center justify-center gap-2">
                      <span>✨</span>
                      Try These Questions
                    </h4>
                    <div className="space-y-4">
                      {[
                        { icon: "📝", text: "Summarize the main concepts", color: "from-blue-500 to-cyan-500" },
                        { icon: "🎯", text: "Explain chapter 3 in simple terms", color: "from-purple-500 to-pink-500" },
                        { icon: "💡", text: "What are the key takeaways?", color: "from-pink-500 to-rose-500" }
                      ].map((item, idx) => (
                        <div key={idx} className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r ${item.color}/10 border border-white/10 hover:scale-105 transition-transform cursor-pointer`}>
                          <span className="text-2xl">{item.icon}</span>
                          <p className="text-white font-medium">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                msgs.map((m, i) => (
                  <div key={i} className={`flex ${m.type === "user" ? "justify-end" : "justify-start"} animate-slideIn`}>
                    <div className={`max-w-[85%] rounded-3xl p-5 shadow-2xl backdrop-blur-sm ${
                        m.type === "user"
                          ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white ml-auto"
                          : m.isError
                          ? "bg-red-500/20 border-2 border-red-500/50 text-red-200"
                          : m.isSuccess
                          ? "bg-green-500/20 border-2 border-green-500/50 text-green-200"
                          : "bg-white/10 border border-white/20 text-white"
                      }`}
                    >
                      {m.type === "user" ? (
                        <p className="font-medium text-lg leading-relaxed">{m.q}</p>
                      ) : (
                        <>
                          {!m.q && (
                            <div className="flex items-center gap-2 mb-3">
                              <div className={`w-2.5 h-2.5 rounded-full ${
                                m.isError ? "bg-red-400" : 
                                m.isSuccess ? "bg-green-400" : 
                                "bg-blue-400"
                              } animate-pulse`}></div>
                              <span className="text-xs font-bold uppercase tracking-wide">
                                {m.isError ? "Error" : m.isSuccess ? "Success" : "AI Response"}
                              </span>
                            </div>
                          )}
                          <p className="whitespace-pre-wrap leading-relaxed text-base">{m.a}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="flex justify-start animate-slideIn">
                  <div className="bg-white/10 border border-white/20 rounded-3xl p-5 shadow-2xl backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-xs font-bold text-white uppercase tracking-wide">AI Thinking</span>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/10 p-6 bg-white/5 backdrop-blur-sm">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    className="w-full bg-white/10 border-2 border-white/20 rounded-2xl px-6 py-4 pr-16 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-xl transition-all duration-200 backdrop-blur-sm"
                    placeholder={currentNamespace ? "Ask me anything..." : "Upload a PDF to get started..."}
                    value={txt}
                    onChange={e => setTxt(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && ask()}
                    disabled={isLoading}
                  />
                  <button
                    onClick={ask}
                    disabled={!txt.trim() || isLoading}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white p-3 rounded-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
                <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-lg">
                  <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-bold text-white border border-white/20">Enter</kbd>
                  <span>Send</span>
                </span>
                <span>•</span>
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-bold">Powered by Groq + Voyage AI</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(50px, 50px) scale(1.05);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }
      `}</style>
    </main>
  );
}