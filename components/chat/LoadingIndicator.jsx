// components/chat/LoadingIndicator.jsx
export default function LoadingIndicator() {
  return (
    <div className="flex justify-start animate-fadeIn">
      <div className="relative">
        {/* Glow */}
        <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur opacity-40"></div>

        {/* Card */}
        <div className="relative bg-white/10 border border-white/20 rounded-3xl p-5 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-ping absolute"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
            <span className="text-xs font-semibold text-white uppercase tracking-wider">
              AI is thinking
            </span>
          </div>

          {/* Typing dots */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 animate-bounce"></span>
            <span
              className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-purple-500 animate-bounce"
              style={{ animationDelay: "0.15s" }}
            ></span>
            <span
              className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-400 to-pink-500 animate-bounce"
              style={{ animationDelay: "0.3s" }}
            ></span>
          </div>
        </div>
      </div>
    </div>
  );
}
