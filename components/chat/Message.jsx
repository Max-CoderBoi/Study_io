export default function Message({ message }) {
  const { type, q, a, isError, isSuccess } = message;

  return (
    <div className={`flex ${type === "user" ? "justify-end" : "justify-start"} mb-6`}>
      <div className={`max-w-[80%] ${
          type === "user"
            ? "bg-zinc-800 text-zinc-100"
            : isError
            ? "bg-red-950/40 text-red-200"
            : isSuccess
            ? "bg-emerald-950/40 text-emerald-200"
            : "bg-zinc-900/80 text-zinc-300"
        } rounded-2xl px-4 py-3 border border-zinc-800/50 shadow-sm`}
      >
        {type === "user" ? (
          <p className="text-sm leading-relaxed">{q}</p>
        ) : (
          <>
            {!q && (
              <div className="flex items-center gap-2 mb-2 opacity-60">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  isError ? "bg-red-400" : 
                  isSuccess ? "bg-emerald-400" : 
                  "bg-zinc-500"
                }`}></div>
                <span className="text-[10px] font-medium uppercase tracking-wider">
                  {isError ? "Error" : isSuccess ? "Success" : "Assistant"}
                </span>
              </div>
            )}
            <p className="whitespace-pre-wrap leading-relaxed text-sm">{a}</p>
          </>
        )}
      </div>
    </div>
  );
}

// Demo
function App() {
  const messages = [
    { type: "user", q: "What's the weather like today?" },
    { type: "ai", a: "Based on current conditions, it's partly cloudy with temperatures around 72°F. Perfect weather for outdoor activities!" },
    { type: "user", q: "Can you help me with an error?" },
    { type: "ai", a: "Connection timeout. Please check your network and try again.", isError: true },
    { type: "user", q: "Process my request" },
    { type: "ai", a: "Your request has been processed successfully.", isSuccess: true }
  ];

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-3xl mx-auto">
        {messages.map((msg, i) => (
          <Message key={i} message={msg} />
        ))}
      </div>
    </div>
  );
}