
// components/chat/Message.jsx
export default function Message({ message }) {
  const { type, q, a, isError, isSuccess } = message;

  return (
    <div className={`flex ${type === "user" ? "justify-end" : "justify-start"} animate-slideIn`}>
      <div className={`max-w-[85%] rounded-3xl p-5 shadow-2xl backdrop-blur-sm ${
          type === "user"
            ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white ml-auto"
            : isError
            ? "bg-red-500/20 border-2 border-red-500/50 text-red-200"
            : isSuccess
            ? "bg-green-500/20 border-2 border-green-500/50 text-green-200"
            : "bg-white/10 border border-white/20 text-white"
        }`}
      >
        {type === "user" ? (
          <p className="font-medium text-lg leading-relaxed">{q}</p>
        ) : (
          <>
            {!q && (
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  isError ? "bg-red-400" : 
                  isSuccess ? "bg-green-400" : 
                  "bg-blue-400"
                } animate-pulse`}></div>
                <span className="text-xs font-bold uppercase tracking-wide">
                  {isError ? "Error" : isSuccess ? "Success" : "AI Response"}
                </span>
              </div>
            )}
            <p className="whitespace-pre-wrap leading-relaxed text-base">{a}</p>
          </>
        )}
      </div>
    </div>
  );
}