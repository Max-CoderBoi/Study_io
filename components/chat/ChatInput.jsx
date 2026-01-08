// components/chat/ChatInput.jsx
export default function ChatInput({ value, onChange, onSend, disabled, hasNamespace }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      onSend();
    }
  };

  return (
    <div className="border-t border-white/10 p-6 bg-white/5 backdrop-blur-sm">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            className="w-full bg-white/10 border-2 border-white/20 rounded-2xl px-6 py-4 pr-16 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-xl transition-all duration-200 backdrop-blur-sm"
            placeholder={hasNamespace ? "Ask me anything..." : "Upload a PDF to get started..."}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />
          <button
            onClick={onSend}
            disabled={!value.trim() || disabled}
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
  );
}