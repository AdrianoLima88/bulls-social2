import React, { useState } from 'react';
import { X, Image as ImageIcon, Film, File, FileText, Music, Archive } from 'lucide-react';

export const AttachmentModal = ({ onClose, onSelectAttachment, type }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls,   setPreviewUrls]   = useState<(string | null)[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []) as File[];
    setSelectedFiles(files);
    setPreviewUrls(
      files.map(f =>
        f.type.startsWith('image/') || f.type.startsWith('video/')
          ? URL.createObjectURL(f)
          : null
      )
    );
  };

  const handleSend = () => {
    if (selectedFiles.length > 0) {
      onSelectAttachment(selectedFiles, previewUrls);
      onClose();
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/'))   return <ImageIcon className="w-8 h-8 text-green-600" />;
    if (file.type.startsWith('video/'))   return <Film      className="w-8 h-8 text-purple-600" />;
    if (file.type.startsWith('audio/'))   return <Music     className="w-8 h-8 text-blue-600" />;
    if (file.type.includes('pdf') || file.type.includes('document')) return <FileText className="w-8 h-8 text-red-600" />;
    if (file.type.includes('zip') || file.type.includes('rar'))      return <Archive  className="w-8 h-8 text-orange-600" />;
    return <File className="w-8 h-8 text-slate-600" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
  };

  const title       = type === 'media' ? 'Attach Photo / Video' : 'Attach File';
  const acceptTypes = type === 'media' ? 'image/*,video/*' : '*';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden flex flex-col">

        <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {selectedFiles.length === 0 ? (
            <div className="text-center py-12">
              <label className="cursor-pointer">
                <input type="file" accept={acceptTypes} multiple onChange={handleFileSelect} className="hidden" />
                <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-green-200 transition">
                  {type === 'media'
                    ? <ImageIcon className="w-16 h-16 text-green-600" />
                    : <File className="w-16 h-16 text-green-600" />}
                </div>
                <p className="text-slate-900 font-semibold mb-1">
                  {type === 'media' ? 'Select photos or videos' : 'Select files'}
                </p>
                <p className="text-green-600 text-sm">Click to choose from your gallery</p>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              {type === 'media' && (
                <div className="grid grid-cols-2 gap-3">
                  {selectedFiles.map((file, i) => (
                    <div key={i} className="relative aspect-square bg-slate-100 rounded-xl overflow-hidden">
                      {file.type.startsWith('image/') ? (
                        <img src={previewUrls[i] ?? ''} alt={file.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800">
                          <Film className="w-12 h-12 text-white" />
                        </div>
                      )}
                      <button
                        onClick={() => { setSelectedFiles(f => f.filter((_, j) => j !== i)); setPreviewUrls(u => u.filter((_, j) => j !== i)); }}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {type === 'file' && (
                <div className="space-y-2">
                  {selectedFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="flex-shrink-0">{getFileIcon(file)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-900 font-medium truncate">{file.name}</p>
                        <p className="text-slate-500 text-sm">{formatSize(file.size)}</p>
                      </div>
                      <button
                        onClick={() => setSelectedFiles(f => f.filter((_, j) => j !== i))}
                        className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center"
                      >
                        <X className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label className="block">
                <input type="file" accept={acceptTypes} multiple onChange={handleFileSelect} className="hidden" />
                <div className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl text-center font-semibold cursor-pointer hover:bg-slate-200 transition">
                  + Add more files
                </div>
              </label>
            </div>
          )}
        </div>

        {selectedFiles.length > 0 && (
          <div className="bg-white border-t border-slate-200 p-4 flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition">
              Cancel
            </button>
            <button onClick={handleSend} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition">
              Send {selectedFiles.length > 1 ? `(${selectedFiles.length})` : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
