// components/chat/MessageList.jsx
import Message from "./Message";
import LoadingIndicator from "./LoadingIndicator";
import WelcomeScreen from "../ui/WelcomeScreen";

export default function MessageList({ messages, isLoading, messagesEndRef }) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
      {messages.length === 0 ? (
        <WelcomeScreen />
      ) : (
        messages.map((m, i) => <Message key={i} message={m} />)
      )}
      
      {isLoading && <LoadingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
}