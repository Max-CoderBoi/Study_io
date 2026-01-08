// components/layout/Sidebar.jsx
import DocumentCard from "../upload/DocumentCard";

export default function Sidebar({ uploadedFiles, currentNamespace, onSwitchDocument }) {
  if (uploadedFiles.length === 0) return null;

  return (
    <div className="lg:w-72 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 h-fit">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white text-lg flex items-center gap-2">
          <span className="text-xl">📁</span>
          Documents
        </h3>
        <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
          {uploadedFiles.length}
        </span>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {uploadedFiles.map((file, idx) => (
          <DocumentCard
            key={idx}
            file={file}
            isActive={currentNamespace === file.namespace}
            onClick={onSwitchDocument}
          />
        ))}
      </div>
    </div>
  );
}