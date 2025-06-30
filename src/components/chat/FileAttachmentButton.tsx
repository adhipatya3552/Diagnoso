import React, { useState, useRef } from 'react';
import { Paperclip, Image, FileText, Camera, MapPin, Mic, X } from 'lucide-react';

interface FileAttachmentButtonProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export const FileAttachmentButton: React.FC<FileAttachmentButtonProps> = ({
  onFileSelect,
  disabled = false
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      setShowMenu(false);
      
      // Reset the input value so the same file can be selected again
      e.target.value = '';
    }
  };
  
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        disabled={disabled}
        className={`p-3 rounded-full transition-colors ${
          disabled 
            ? 'text-white/30 cursor-not-allowed' 
            : 'text-white hover:bg-white/10'
        }`}
      >
        <Paperclip className={`w-5 h-5 ${showMenu ? 'rotate-45' : 'rotate-0'} transition-transform duration-300`} />
      </button>
      
      {showMenu && (
        <div className="absolute bottom-full left-0 mb-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg p-2 animate-slide-up z-10">
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-1">
                <Image className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-white">Photo</span>
            </button>
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center mb-1">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-white">Document</span>
            </button>
            
            <button
              type="button"
              className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-1">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-white">Camera</span>
            </button>
            
            <button
              type="button"
              className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-1">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-white">Location</span>
            </button>
            
            <button
              type="button"
              className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mb-1">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-white">Audio</span>
            </button>
            
            <button
              type="button"
              onClick={() => setShowMenu(false)}
              className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 bg-gray-500/50 rounded-full flex items-center justify-center mb-1">
                <X className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-white">Cancel</span>
            </button>
          </div>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.csv"
      />
      
      <input
        ref={imageInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
    </div>
  );
};