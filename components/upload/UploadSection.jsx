// components/upload/UploadSection.jsx
export default function UploadSection({ isUploading, currentNamespace, uploadedFiles, onUpload }) {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">
            Upload Document
          </h3>
          <p className="text-zinc-400 text-sm">
            {currentNamespace 
              ? `Current: ${uploadedFiles[uploadedFiles.length - 1]?.name || 'Document'}`
              : 'Upload a PDF to get started'
            }
          </p>
        </div>
        
        <label className="cursor-pointer">
          <input
            type="file"
            accept=".pdf"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) await onUpload(file);
              e.target.value = "";
            }}
            disabled={isUploading}
            className="hidden"
          />
          <div className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
            isUploading 
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700" 
              : "bg-white text-black hover:bg-zinc-100 border border-zinc-200"
          }`}>
            {isUploading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Upload PDF</span>
              </div>
            )}
          </div>
        </label>
      </div>
    </div>
  );
}