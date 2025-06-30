import React, { useState } from 'react';
import { Message } from '../../lib/chatTypes';
import { Download, File, FileText, Image as ImageIcon, Eye, Lock } from 'lucide-react';
import { FilePreview } from './FilePreview';
import { formatBytes } from '../../utils/formatters';

interface FileMessageProps {
  message: Message;
  isCurrentUser: boolean;
}

export const FileMessage: React.FC<FileMessageProps> = ({ message, isCurrentUser }) => {
  const [showPreview, setShowPreview] = useState(false);
  
  if (!message.file_url) return null;
  
  const isImage = message.file_type?.startsWith('image/');
  const isPdf = message.file_type === 'application/pdf';
  const isPreviewable = isImage || isPdf;
  
  const getFileIcon = () => {
    if (isImage) {
      return <ImageIcon className="w-5 h-5 text-blue-500" />;
    } else if (isPdf) {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else if (message.file_type?.includes('word') || message.file_type?.includes('document')) {
      return <FileText className="w-5 h-5 text-blue-700" />;
    } else if (message.file_type?.includes('excel') || message.file_type?.includes('spreadsheet')) {
      return <FileText className="w-5 h-5 text-green-700" />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
  };
  
  if (isImage) {
    return (
      <div className="relative group">
        <div className="relative">
          <img 
            src={message.file_url} 
            alt="Image" 
            className="max-w-xs rounded-lg max-h-60 object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setShowPreview(true)}
          />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPreview(true);
              }}
              className="p-1.5 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
            >
              <Eye className="w-4 h-4 text-white" />
            </button>
            <a 
              href={message.file_url} 
              download={message.file_name}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
            >
              <Download className="w-4 h-4 text-white" />
            </a>
          </div>
          
          <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <Lock className="w-3 h-3 inline-block mr-1" />
            Secure Transfer
          </div>
        </div>
        
        {message.content && message.content !== 'Sent an image' && (
          <p className="mt-1 text-sm">{message.content}</p>
        )}
        
        {showPreview && (
          <FilePreview
            fileUrl={message.file_url}
            fileName={message.file_name || 'Image'}
            fileType={message.file_type || 'image/jpeg'}
            onClose={() => setShowPreview(false)}
          />
        )}
      </div>
    );
  }
  
  return (
    <div className="flex items-center space-x-3 bg-white/10 p-3 rounded-lg group">
      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
        {getFileIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{message.file_name}</p>
        <div className="flex items-center space-x-2">
          <p className="text-xs text-white/70">
            {message.file_size ? formatBytes(message.file_size) : ''}
          </p>
          {isPreviewable && (
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
              Previewable
            </span>
          )}
        </div>
      </div>
      <div className="flex space-x-1">
        {isPreviewable && (
          <button
            onClick={() => setShowPreview(true)}
            className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <Eye className="w-4 h-4 text-white" />
          </button>
        )}
        <a 
          href={message.file_url} 
          download={message.file_name}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
        >
          <Download className="w-4 h-4 text-white" />
        </a>
      </div>
      
      {showPreview && (
        <FilePreview
          fileUrl={message.file_url}
          fileName={message.file_name || 'File'}
          fileType={message.file_type || 'application/octet-stream'}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};