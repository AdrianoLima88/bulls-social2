import React, { useState, useRef } from 'react';
import { X, FileText, Upload, File, Paperclip } from 'lucide-react';

export const AddDocumentModal = ({ onClose, onAddDocument }) => {
  const [docType, setDocType] = useState('text');
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File too large. Maximum 5MB.');
        return;
      }
      setUploadedFile(file);
      setDocTitle(file.name);
    }
  };

  const handleCreate = () => {
    if (docType === 'text') {
      if (!docTitle.trim()) {
        alert('Digite um título para o documento');
        return;
      }
      if (!docContent.trim()) {
        alert('Digite o conteúdo do documento');
        return;
      }

      onAddDocument({
        type: 'text',
        title: docTitle,
        content: docContent,
        size: new Blob([docContent]).size,
      });
    } else {
      if (!uploadedFile) {
        alert('Selecione um arquivo para fazer upload');
        return;
      }

      onAddDocument({
        type: 'upload',
        title: uploadedFile.name,
        file: uploadedFile,
        size: uploadedFile.size,
        fileType: uploadedFile.type,
      });
    }
    onClose();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Add Document</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Document Type */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Document Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDocType('text')}
                className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
                  docType === 'text'
                    ? 'border-green-600 bg-green-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <FileText className={`w-6 h-6 ${docType === 'text' ? 'text-green-600' : 'text-slate-400'}`} />
                <span className={`text-sm font-semibold ${docType === 'text' ? 'text-green-900' : 'text-slate-600'}`}>
                  Text Document
                </span>
              </button>
              <button
                onClick={() => setDocType('upload')}
                className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
                  docType === 'upload'
                    ? 'border-green-600 bg-green-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Upload className={`w-6 h-6 ${docType === 'upload' ? 'text-green-600' : 'text-slate-400'}`} />
                <span className={`text-sm font-semibold ${docType === 'upload' ? 'text-green-900' : 'text-slate-600'}`}>
                  Upload File
                </span>
              </button>
            </div>
          </div>

          {docType === 'text' ? (
            <>
              {/* Título */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Document Title
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="E.g. Fundamental Analysis AAPL"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              {/* Content */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Content
                </label>
                <textarea
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  placeholder="Document content..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 resize-none h-48"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {docContent.length} caracteres
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Upload Area */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Arquivo
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-300 rounded-xl p-8 hover:border-green-600 hover:bg-green-50 transition flex flex-col items-center gap-3"
                >
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-slate-400" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-slate-900">
                      Clique para selecionar arquivo
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      PDF, DOC, XLS, TXT (máx. 5MB)
                    </p>
                  </div>
                </button>
              </div>

              {/* Arquivo Selecionado */}
              {uploadedFile && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <File className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {uploadedFile.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatFileSize(uploadedFile.size)}
                    </p>
                  </div>
                  <button
                    onClick={() => setUploadedFile(null)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Attached documents appear as cards in your post and can be downloaded by your followers.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};
