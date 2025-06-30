import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, File as FileIcon, Image, FileText, AlertCircle, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export interface FileUploadProps {
  onFileSelect: (file: File) => Promise<void>;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  className?: string;
  children?: React.ReactNode;
}

export interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export const FileUploadHandler: React.FC<FileUploadProps> = ({
  onFileSelect,
  maxSize = 10 * 1024 * 1024, // 10MB default
  acceptedTypes = ['image/*', 'application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  className = '',
  children
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`;
    }
    
    if (acceptedTypes.length > 0) {
      const fileType = file.type;
      const isValidType = acceptedTypes.some(type => {
        if (type.includes('*')) {
          return fileType.startsWith(type.split('*')[0]);
        }
        return fileType === type;
      });
      
      if (!isValidType) {
        return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
      }
    }
    
    return null;
  };

  const handleFiles = useCallback(async (files: FileList) => {
    const file = files[0]; // Only handle one file at a time for chat
    
    if (!file) return;
    
    const error = validateFile(file);
    if (error) {
      setUploadingFiles([{
        id: uuidv4(),
        file,
        progress: 0,
        status: 'error',
        error
      }]);
      return;
    }
    
    const newFile: UploadingFile = {
      id: uuidv4(),
      file,
      progress: 0,
      status: 'uploading'
    };
    
    setUploadingFiles([newFile]);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadingFiles(prev => 
        prev.map(f => 
          f.id === newFile.id 
            ? { ...f, progress: Math.min(f.progress + 10, 90) }
            : f
        )
      );
    }, 100);
    
    try {
      await onFileSelect(file);
      
      setUploadingFiles(prev => 
        prev.map(f => 
          f.id === newFile.id 
            ? { ...f, progress: 100, status: 'success' }
            : f
        )
      );
      
      // Clear success after a delay
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.id !== newFile.id));
      }, 2000);
    } catch (err: any) {
      setUploadingFiles(prev => 
        prev.map(f => 
          f.id === newFile.id 
            ? { ...f, status: 'error', error: err.message || 'Upload failed' }
            : f
        )
      );
    } finally {
      clearInterval(interval);
    }
  }, [onFileSelect, maxSize, acceptedTypes]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = (id: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-500" />;
    } else if (file.type.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else if (file.type.includes('word') || file.type.includes('document')) {
      return <FileText className="w-5 h-5 text-blue-700" />;
    }
    return <FileIcon className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className={className}>
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-4 text-center transition-all duration-300
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50 scale-105' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'
          }
          cursor-pointer
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleInputChange}
          className="hidden"
          accept={acceptedTypes.join(',')}
        />
        
        {children || (
          <div className="space-y-2 py-4">
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              isDragOver ? 'bg-blue-100 scale-110' : 'bg-gray-100'
            }`}>
              <Upload className={`w-6 h-6 transition-colors duration-300 ${
                isDragOver ? 'text-blue-500' : 'text-gray-400'
              }`} />
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700">
                {isDragOver ? 'Drop file here' : 'Drag and drop a file here'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Max size: {(maxSize / 1024 / 1024).toFixed(1)}MB
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* File List */}
      {uploadingFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadingFiles.map((uploadFile) => (
            <div
              key={uploadFile.id}
              className={`flex items-center space-x-3 p-3 rounded-lg border ${
                uploadFile.status === 'error' 
                  ? 'bg-red-50 border-red-200' 
                  : uploadFile.status === 'success'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
              }`}
            >
              {getFileIcon(uploadFile.file)}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {uploadFile.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                
                {uploadFile.status === 'uploading' && (
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadFile.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {uploadFile.progress}% uploaded
                    </p>
                  </div>
                )}
                
                {uploadFile.status === 'error' && (
                  <p className="text-xs text-red-600 mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {uploadFile.error}
                  </p>
                )}
                
                {uploadFile.status === 'success' && (
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <Check className="w-3 h-3 mr-1" />
                    Upload complete
                  </p>
                )}
              </div>
              
              <button
                onClick={() => removeFile(uploadFile.id)}
                className={`text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};