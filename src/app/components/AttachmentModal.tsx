import React, { useState } from 'react';
import { X, Image as ImageIcon, Film, File, FileText, Music, Archive } from 'lucide-react';

export const AttachmentModal = ({ onClose, onSelectAttachment, type }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);

    // Criar previews para imagens e vídeos
    const previews = files.map(file => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        return URL.createObjectURL(file);
      }
      return null;
    });
    setPreviewUrls(previews);
  };

  const handleSend = () => {
    if (selectedFiles.length > 0) {
      onSelectAttachment(selectedFiles, previewUrls);
      onClose();
    }
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-green-600" />;
    if (file.type.startsWith('video/')) return <Film className="w-8 h-8 text-purple-600" />;
    if (file.type.startsWith('audio/')) return <Music className="w-8 h-8 text-blue-600" />;
    if (file.type.includes('pdf') || file.type.includes('document')) return <FileText className="w-8 h-8 text-red-600" />;
    if (file.type.includes('zip') || file.type.includes('rar')) return <Archive className="w-8 h-8 text-orange-600" />;
    return <File className="w-8 h-8 text-slate-600" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const title = type === 'media' ? 'Anexar Foto/Vídeo' : 'Anexar Arquivo';
  const acceptTypes = type === 'media' ? 'image/*,video/*' : '*';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedFiles.length === 0 ? (
            <div className="text-center py-12">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept={acceptTypes}
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-green-200 transition">
                  {type === 'media' ? (
                    <ImageIcon className="w-16 h-16 text-green-600" />
                  ) : (
                    <File className="w-16 h-16 text-green-600" />
                  )}
                </div>
                <p className="text-slate-900 font-semibold mb-2">
                  {type === 'media' ? 'Selecione fotos ou vídeos' : 'Selecione arquivos'}
                </p>
                <p className="text-slate-500 text-sm">
                  Clique para escolher da sua galeria
                </p>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview Grid para Imagens/Vídeos */}
              {type === 'media' && (
                <div className="grid grid-cols-2 gap-3">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative aspect-square bg-slate-100 rounded-xl overflow-hidden">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={previewUrls[index]}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800">
                          <Film className="w-12 h-12 text-white" />
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
                          setPreviewUrls(previewUrls.filter((_, i) => i !== index));
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Lista de Arquivos */}
              {type === 'file' && (
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="flex-shrink-0">
                        {getFileIcon(file)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-900 font-medium truncate">{file.name}</p>
                        <p className="text-slate-500 text-sm">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
                        }}
                        className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center hover:bg-slate-300 transition"
                      >
                        <X className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Botão para adicionar mais */}
              <label className="block">
                <input
                  type="file"
                  accept={acceptTypes}
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl text-center font-semibold cursor-pointer hover:bg-slate-200 transition">
                  + Add mais arquivos
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedFiles.length > 0 && (
          <div className="bg-white border-t border-slate-200 p-4 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
            >
              Enviar {selectedFiles.length > 1 && `(${selectedFiles.length})`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};