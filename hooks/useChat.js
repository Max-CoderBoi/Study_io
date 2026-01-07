// hooks/useChat.js
import { useState, useRef, useEffect } from "react";

export const useChat = () => {
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

  const ask = async () => {
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
  };

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

  return {
    msgs,
    txt,
    setTxt,
    isLoading,
    isUploading,
    currentNamespace,
    uploadedFiles,
    messagesEndRef,
    ask,
    uploadPDF,
    clearChat,
    switchDocument
  };
};