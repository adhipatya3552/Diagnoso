import React, { useState, useEffect } from 'react';
import { Message } from '../../lib/chatTypes';
import { FilePreview } from './FilePreview';
import { Image, FileText, File as FileIcon, Download, Eye } from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

interface FileGalleryProps {
  conversationId: string;
  messages: Message[];
  onClose: () => void;
}

export const FileGallery: React.FC<FileGalleryProps> = ({
  conversationId,
  messages,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'documents'>('all');
  const [previewFile, setPreviewFile] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter messages to only include files
  const fileMessages = messages.filter(msg => 
    (msg.message_type === 'file' || msg.message_type === 'image') && 
    msg.file_url && 
    !msg.is_deleted
  );
  
  // Filter based on active tab and search term
  const filteredFiles = fileMessages.filter(msg => {
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'images' && msg.message_type === 'image') ||
      (activeTab === 'documents' && msg.message_type === 'file');
    
    const matchesSearch = 
      !searchTerm || 
      msg.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.content?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesSearch;
  });
  
  // Group files by date
  const groupedFiles: { [date: string]: Message[] } = {};
  
  filteredFiles.forEach(file => {
    const date = new Date(file.created_at).toLocaleDateString();
    if (!groupedFiles[date]) {
      groupedFiles[date] = [];
    }
    groupedFiles[date].push(file);
  });
  
  const getFileIcon = (fileType: string | undefined) => {
    if (!fileType) return <FileIcon className="w-5 h-5 text-gray-500" />;
    
    if (fileType.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="w-5 h-5 text-blue-700" />;
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return <FileText className="w-5 h-5 text-green-700" />;
    }
    
    return <FileIcon className="w-5 h-5 text-gray-500" />;
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col">
      <div className="p-4 bg-white/10 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Shared Files</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mt-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              All Files
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'images' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Images
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'documents' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Documents
            </button>
          </div>
          
          <div className="mt-4 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search files..."
              className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {Object.keys(groupedFiles).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedFiles).map(([date, files]) => (
              <div key={date}>
                <h3 className="text-white/70 text-sm mb-2">{date}</h3>
                
                {activeTab === 'images' || (activeTab === 'all' && files.some(f => f.message_type === 'image')) ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                    {files.filter(f => f.message_type === 'image').map(file => (
                      <div 
                        key={file.id}
                        className="relative group cursor-pointer rounded-lg overflow-hidden"
                        onClick={() => setPreviewFile(file)}
                      >
                        <img 
                          src={file.file_url} 
                          alt={file.file_name || 'Image'} 
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="text-white text-center p-2">
                            <p className="text-sm font-medium truncate max-w-[90%] mx-auto">{file.file_name}</p>
                            <div className="flex justify-center space-x-2 mt-2">
                              <button className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                              <a 
                                href={file.file_url} 
                                download={file.file_name}
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
                
                {activeTab === 'documents' || (activeTab === 'all' && files.some(f => f.message_type === 'file')) ? (
                  <div className="space-y-2">
                    {files.filter(f => f.message_type === 'file').map(file => (
                      <div 
                        key={file.id}
                        className="bg-white/10 rounded-lg p-3 hover:bg-white/15 transition-colors cursor-pointer flex items-center space-x-3"
                        onClick={() => setPreviewFile(file)}
                      >
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                          {getFileIcon(file.file_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{file.file_name}</p>
                          <div className="flex items-center space-x-3">
                            <p className="text-xs text-white/70">
                              {file.file_size ? formatBytes(file.file_size) : ''}
                            </p>
                            <p className="text-xs text-white/70">
                              {new Date(file.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <button className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                            <Eye className="w-4 h-4 text-white" />
                          </button>
                          <a 
                            href={file.file_url} 
                            download={file.file_name}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                          >
                            <Download className="w-4 h-4 text-white" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white/70">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
              {activeTab === 'images' ? (
                <Image className="w-8 h-8 text-white/50" />
              ) : activeTab === 'documents' ? (
                <FileText className="w-8 h-8 text-white/50" />
              ) : (
                <FileIcon className="w-8 h-8 text-white/50" />
              )}
            </div>
            <p className="text-lg font-medium mb-2">No files found</p>
            <p className="text-sm">
              {searchTerm 
                ? "Try a different search term" 
                : `No ${activeTab === 'images' ? 'images' : activeTab === 'documents' ? 'documents' : 'files'} have been shared in this conversation yet`
              }
            </p>
          </div>
        )}
      </div>
      
      {previewFile && (
        <FilePreview
          fileUrl={previewFile.file_url || ''}
          fileName={previewFile.file_name || 'File'}
          fileType={previewFile.file_type || 'application/octet-stream'}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
};