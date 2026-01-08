// components/upload/DocumentCard.jsx
export default function DocumentCard({ file, isActive, onClick }) {
  return (
    <button
      onClick={() => onClick(file.namespace, file.name)}
      className={`w-full text-left p-3 rounded-lg transition-colors duration-150 ${
        isActive
          ? "bg-white text-black"
          : "bg-transparent text-zinc-300 hover:bg-zinc-800"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-base">📄</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {file.name.replace('.pdf', '')}
          </p>
        </div>
      </div>
    </button>
  );
}