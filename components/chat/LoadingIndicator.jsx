// components/chat/LoadingIndicator.jsx
export default function LoadingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white/60 animate-bounce"></span>
          <span
            className="w-2 h-2 rounded-full bg-white/60 animate-bounce"
            style={{ animationDelay: "0.15s" }}
          ></span>
          <span
            className="w-2 h-2 rounded-full bg-white/60 animate-bounce"
            style={{ animationDelay: "0.3s" }}
          ></span>
        </div>
      </div>
    </div>
  );
}
