// components/chat/ChatHeader.jsx
import Button from "../ui/Button";

export default function ChatHeader({ messageCount, onClearChat }) {
  return (
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
      {messageCount > 0 && (
        <Button onClick={onClearChat} variant="secondary">
          Clear Chat
        </Button>
      )}
    </div>
  );
}