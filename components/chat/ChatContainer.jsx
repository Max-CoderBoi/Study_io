// components/chat/ChatContainer.jsx
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

export default function ChatContainer({ 
  messages, 
  isLoading, 
  messagesEndRef,
  inputValue,
  onInputChange,
  onSend,
  onClearChat,
  hasNamespace
}) {
  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 flex flex-col h-[600px] md:h-[700px] overflow-hidden">
      <ChatHeader messageCount={messages.length} onClearChat={onClearChat} />
      <MessageList messages={messages} isLoading={isLoading} messagesEndRef={messagesEndRef} />
      <ChatInput 
        value={inputValue}
        onChange={onInputChange}
        onSend={onSend}
        disabled={isLoading}
        hasNamespace={hasNamespace}
      />
    </div>
  );
}