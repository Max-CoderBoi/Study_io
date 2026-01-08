// components/layout/Sidebar.jsx
import DocumentCard from "../upload/DocumentCard";

export default function Sidebar({ uploadedFiles, currentNamespace, onSwitchDocument }) {
  if (uploadedFiles.length === 0) return null;

  return (
    <div className="lg:w-72 bg-zinc-900 rounded-xl border border-zinc-800 p-5 h-fit">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white text-base flex items-center gap-2">
          <span className="text-lg">📁</span>
          Documents
        </h3>
        <span className="bg-zinc-800 text-zinc-300 text-xs px-2.5 py-1 rounded-lg font-medium border border-zinc-700">
          {uploadedFiles.length}
        </span>
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
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