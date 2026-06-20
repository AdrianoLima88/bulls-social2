import React from 'react';
import { FileText, Download, Eye } from 'lucide-react';

export const DocumentPreview = ({ document }) => {
  const { type, title, content, size } = document;

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDownload = () => {
    if (type === 'text') {
      // Criar arquivo de texto para download
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = title.endsWith('.txt') ? title : `${title}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      alert('Download simulado: ' + title);
    }
  };

  const handleView = () => {
    if (type === 'text') {
      alert('Content do documento:\n\n' + content);
    } else {
      alert('Visualizar: ' + title);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200 overflow-hidden mb-3">
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText className="w-7 h-7 text-blue-600" />
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-900 mb-1 truncate">{title}</h4>
            <p className="text-sm text-slate-500 mb-3">
              {type === 'text' ? 'Documento de texto' : 'Arquivo anexado'} • {formatFileSize(size)}
            </p>
            
            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleView}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm font-semibold"
              >
                <Eye className="w-4 h-4" />
                Visualizar
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold"
              >
                <Download className="w-4 h-4" />
                Baixar
              </button>
            </div>
          </div>
        </div>
        
        {/* Preview do conteúdo para documentos de texto */}
        {type === 'text' && content && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600 line-clamp-3">
              {content}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
