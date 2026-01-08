// components/chat/LoadingIndicator.jsx
export default function LoadingIndicator() {
  return (
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
  );
}