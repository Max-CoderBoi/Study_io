// components/layout/Header.jsx
export default function Header() {
  return (
    <div className="w-full max-w-6xl text-center mb-8 relative z-10">
      <div className="flex items-center justify-center gap-4 mb-3">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-75 animate-pulse"></div>
          <div className="relative w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300">
            <span className="text-3xl">📚</span>
          </div>
        </div>
        <div>
          <h1 className="text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
            Study.io
          </h1>
          <p className="text-purple-300 text-sm font-medium mt-1">AI-Powered Learning Assistant</p>
        </div>
      </div>
      <p className="text-gray-300 text-lg max-w-2xl mx-auto">
        Upload your study materials and get instant, intelligent answers powered by advanced AI
      </p>
    </div>
  );
}