import React, { useCallback, useState } from 'react';
import { Upload, File, Image, X, CheckCircle, AlertCircle } from 'lucide-react';

export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  onFilesChange: (files: File[]) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export interface UploadedFile {
  file: File;
  id: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 5,
  onFilesChange,
  onError,
  disabled = false,
  className = '',
  children
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`;
    }
    
    if (accept) {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const isValidType = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type.match(type.replace('*', '.*'));
      });
      
      if (!isValidType) {
        return `File type not supported. Accepted types: ${accept}`;
      }
    }
    
    return null;
  };

  const handleFiles = useCallback((files: FileList) => {
    const fileArray = Array.from(files);
    
    if (!multiple && fileArray.length > 1) {
      onError?.('Only one file is allowed');
      return;
    }
    
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      onError?.(`Maximum ${maxFiles} files allowed`);
      return;
    }
    
    const validFiles: File[] = [];
    const errors: string[] = [];
    
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });
    
    if (errors.length > 0) {
      onError?.(errors.join('\n'));
    }
    
    if (validFiles.length > 0) {
      const newUploadedFiles = validFiles.map(file => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        progress: 0,
        status: 'uploading' as const
      }));
      
      setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
      onFilesChange(validFiles);
      
      // Simulate upload progress
      newUploadedFiles.forEach(uploadedFile => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 30;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setUploadedFiles(prev => 
              prev.map(f => 
                f.id === uploadedFile.id 
                  ? { ...f, progress: 100, status: 'success' }
                  : f
              )
            );
          } else {
            setUploadedFiles(prev => 
              prev.map(f => 
                f.id === uploadedFile.id 
                  ? { ...f, progress }
                  : f
              )
            );
          }
        }, 200);
      });
    }
  }, [multiple, maxFiles, maxSize, accept, uploadedFiles.length, onFilesChange, onError]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (!disabled && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [disabled, handleFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-8 h-8 text-blue-500" />;
    }
    return <File className="w-8 h-8 text-gray-500" />;
  };

  return (
    <div className={className}>
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50 scale-105' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />
        
        {children || (
          <div className="space-y-4">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
              isDragOver ? 'bg-blue-100 scale-110' : 'bg-gray-100'
            }`}>
              <Upload className={`w-8 h-8 transition-colors duration-300 ${
                isDragOver ? 'text-blue-500' : 'text-gray-400'
              }`} />
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragOver ? 'Drop files here' : 'Upload files'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Drag and drop files here, or click to browse
              </p>
              {accept && (
                <p className="text-xs text-gray-400 mt-2">
                  Accepted formats: {accept}
                </p>
              )}
              <p className="text-xs text-gray-400">
                Max size: {(maxSize / 1024 / 1024).toFixed(1)}MB
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadedFiles.map((uploadedFile) => (
            <div
              key={uploadedFile.id}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border"
            >
              {getFileIcon(uploadedFile.file)}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {uploadedFile.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                
                {uploadedFile.status === 'uploading' && (
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${uploadedFile.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {uploadedFile.status === 'success' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {uploadedFile.status === 'error' && (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                
                <button
                  onClick={() => removeFile(uploadedFile.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};