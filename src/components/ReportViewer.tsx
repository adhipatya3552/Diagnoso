import React, { useState, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight, Maximize, Minimize } from 'lucide-react';

interface ReportViewerProps {
  fileUrl: string;
  fileName: string;
  fileType: string;
  onClose: () => void;
  onDownload?: () => void;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({
  fileUrl,
  fileName,
  fileType,
  onClose,
  onDownload
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const isImage = fileType.startsWith('image/');
  const isPdf = fileType === 'application/pdf';
  
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);
  
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(err => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`);
        });
      }
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-white/10 backdrop-blur-md p-4 flex items-center justify-between">
        <h3 className="text-white font-medium truncate max-w-md">{fileName}</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownload}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
          
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-4xl w-full max-h-[80vh] overflow-auto">
        {isImage ? (
          <div className="relative">
            <img
              src={fileUrl}
              alt={fileName}
              className="max-w-full h-auto mx-auto object-contain transition-all duration-300"
              style={{ 
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center center'
              }}
            />
            
            {/* Image Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full p-2 flex items-center space-x-2">
              <button
                onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              
              <div className="text-white text-sm px-2">
                {Math.round(zoom * 100)}%
              </div>
              
              <button
                onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              
              <div className="w-px h-6 bg-white/20 mx-2" />
              
              <button
                onClick={() => setRotation(prev => (prev + 90) % 360)}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
                title="Rotate"
              >
                <RotateCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : isPdf ? (
          <iframe
            src={`${fileUrl}#view=FitH`}
            title={fileName}
            className="w-full h-[80vh] border-0 rounded-lg"
          />
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-10 h-10 text-white/70" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Preview not available</h3>
            <p className="text-white/70 mb-6">
              This file type cannot be previewed directly in the browser.
            </p>
            <button
              onClick={handleDownload}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all shadow-lg flex items-center justify-center space-x-2 mx-auto"
            >
              <Download className="w-5 h-5" />
              <span>Download File</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Navigation arrows for image galleries */}
      {isImage && (
        <>
          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
            onClick={() => {/* Previous image */}}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
            onClick={() => {/* Next image */}}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
    </div>
  );
};