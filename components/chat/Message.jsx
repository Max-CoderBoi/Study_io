import { useEffect, useState } from "react";

export default function Message({ message }) {
  const { type, q, a, isError, isSuccess } = message;
  const [displayedText, setDisplayedText] = useState(
    type === "ai" ? "" : a
  );

  useEffect(() => {
    if (type !== "ai" || !a) return;

    let index = 0;
    setDisplayedText("");

    const interval = setInterval(() => {
      if (index < a.length) {
        setDisplayedText((prev) => prev + a[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 18);

    return () => clearInterval(interval);
  }, [a, type]);

  return (
    <div className={`flex ${type === "user" ? "justify-end" : "justify-start"} mb-6`}>
      <div
        className={`max-w-[80%] ${
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
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    isError
                      ? "bg-red-400"
                      : isSuccess
                      ? "bg-emerald-400"
                      : "bg-zinc-500"
                  }`}
                ></div>
                <span className="text-[10px] font-medium uppercase tracking-wider">
                  {isError ? "Error" : isSuccess ? "Success" : "Assistant"}
                </span>
              </div>
            )}

            <p className="whitespace-pre-wrap leading-relaxed text-sm">
              {displayedText}
              {displayedText.length < a.length && (
                <span className="inline-block w-[2px] h-4 ml-0.5 bg-zinc-400 animate-pulse align-middle" />
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
}