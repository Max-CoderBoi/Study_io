// components/ui/WelcomeScreen.jsx
export default function WelcomeScreen() {
  const exampleQuestions = [
    { icon: "📝", text: "Summarize the main concepts", color: "from-blue-500 to-cyan-500" },
    { icon: "🎯", text: "Explain chapter 3 in simple terms", color: "from-purple-500 to-pink-500" },
    { icon: "💡", text: "What are the key takeaways?", color: "from-pink-500 to-rose-500" }
  ];

  return (
    <div className="text-center text-gray-300 mt-16">
      <div className="relative inline-block mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-50"></div>
        <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center shadow-2xl border border-white/20">
          <span className="text-5xl">💬</span>
        </div>
      </div>
      <h3 className="text-3xl font-bold text-white mb-3">
        Welcome to Study.io
      </h3>
      <p className="text-lg max-w-md mx-auto mb-8 text-gray-400">
        Upload your study materials and start learning smarter, not harder
      </p>
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-8 max-w-lg mx-auto border border-white/10 backdrop-blur-sm">
        <h4 className="font-bold text-white mb-5 text-xl flex items-center justify-center gap-2">
          <span>✨</span>
          Try These Questions
        </h4>
        <div className="space-y-4">
          {exampleQuestions.map((item, idx) => (
            <div 
              key={idx} 
              className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r ${item.color}/10 border border-white/10 hover:scale-105 transition-transform cursor-pointer`}
            >
              <span className="text-2xl">{item.icon}</span>
              <p className="text-white font-medium">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}