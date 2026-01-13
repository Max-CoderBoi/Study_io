// components/ui/WelcomeScreen.jsx
export default function WelcomeScreen({ onQuestionClick }) {
  const exampleQuestions = [
    { icon: "📝", text: "Summarize the main concepts", gradient: "from-zinc-700 to-zinc-800" },
    { icon: "🎯", text: "Explain chapter 3 in simple terms", gradient: "from-zinc-700 to-zinc-800" },
    { icon: "💡", text: "What are the key takeaways?", gradient: "from-zinc-700 to-zinc-800" }
  ];

  return (
    <div className="text-center text-zinc-400 mt-16 px-4">
      {/* Logo/Icon Section */}
      <div className="relative inline-block mb-8">
        <div className="absolute inset-0 bg-zinc-800 rounded-3xl blur-2xl opacity-40"></div>
        <div className="relative w-20 h-20 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl flex items-center justify-center shadow-2xl border border-zinc-700/50">
          <span className="text-4xl">💬</span>
        </div>
      </div>

      {/* Heading */}
      <h3 className="text-4xl font-bold text-zinc-100 mb-4 tracking-tight">
        Welcome to Study.io
      </h3>
      <p className="text-base max-w-md mx-auto mb-12 text-zinc-500 leading-relaxed">
        Upload your study materials and start learning smarter, not harder
      </p>

      {/* Example Questions Card */}
      <div className="bg-zinc-950/50 rounded-2xl p-6 max-w-xl mx-auto border border-zinc-800/50 backdrop-blur-sm shadow-xl">
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-xl">✨</span>
          <h4 className="font-semibold text-zinc-200 text-lg">
            Try These Questions
          </h4>
        </div>
        
        <div className="space-y-3">
          {exampleQuestions.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onQuestionClick?.(item.text)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${item.gradient} border border-zinc-700/30 hover:border-zinc-600/50 hover:bg-zinc-800/80 transition-all duration-200 group cursor-pointer`}
            >
              <div className="flex-shrink-0 w-10 h-10 bg-zinc-900/50 rounded-lg flex items-center justify-center border border-zinc-700/30 group-hover:scale-110 transition-transform">
                <span className="text-xl">{item.icon}</span>
              </div>
              <p className="text-zinc-200 font-medium text-left text-sm group-hover:text-zinc-100 transition-colors">
                {item.text}
              </p>
              <svg 
                className="ml-auto w-5 h-5 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Additional Hint */}
      <p className="text-xs text-zinc-600 mt-8 flex items-center justify-center gap-2">
        <span>💡</span>
        <span>Upload a document to get started</span>
      </p>
    </div>
  );
}

// Demo
function Demo() {
  const handleQuestionClick = (question) => {
    alert(`You clicked: ${question}`);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <WelcomeScreen onQuestionClick={handleQuestionClick} />
    </div>
  );
}