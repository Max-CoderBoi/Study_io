// components/upload/UploadSection.jsx
export default function UploadSection({ isUploading, currentNamespace, uploadedFiles, onUpload }) {
  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <span>📚</span>
            Upload Study Materials
          </h3>
          <p className="text-gray-300 text-sm">
            {currentNamespace 
              ? `📖 Current: ${uploadedFiles[uploadedFiles.length - 1]?.name || 'Document'}`
              : 'Drop your PDFs here to unlock AI-powered insights'
            }
          </p>
        </div>
        <label className="relative cursor-pointer group">
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
          <div className={`relative px-8 py-4 rounded-2xl font-bold transition-all duration-300 ${
            isUploading 
              ? "bg-gray-600 text-gray-400 cursor-not-allowed" 
              : "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:shadow-2xl hover:scale-110 shadow-xl transform"
          }`}>
            <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            {isUploading ? (
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
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