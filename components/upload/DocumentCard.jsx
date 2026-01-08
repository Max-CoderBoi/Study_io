// components/upload/DocumentCard.jsx
export default function DocumentCard({ file, isActive, onClick }) {
  return (
    <button
      onClick={() => onClick(file.namespace, file.name)}
      className={`w-full text-left p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
        isActive
          ? "bg-gradient-to-r from-blue-500/30 to-purple-500/30 border-2 border-blue-400 shadow-lg"
          : "bg-white/5 border border-white/10 hover:bg-white/10"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">📄</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {file.name.replace('.pdf', '')}
          </p>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <span>🕐</span>
            {file.uploadedAt}
          </p>
        </div>
        {isActive && (
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        )}
      </div>
    </button>
  );
}