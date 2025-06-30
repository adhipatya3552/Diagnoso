import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, RotateCw, ZoomIn, ZoomOut, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

export interface ProfilePhotoUploadProps {
  currentPhoto?: string;
  onPhotoChange: (file: File, croppedDataUrl: string) => void;
  onPhotoRemove?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  currentPhoto,
  onPhotoChange,
  onPhotoRemove,
  size = 'lg',
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setIsModalOpen(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - crop.x, y: e.clientY - crop.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setCrop({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getCroppedImage = (): string => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image) return '';

    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const size = 300; // Output size
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Save context
    ctx.save();

    // Apply transformations
    ctx.translate(size / 2, size / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.translate(-size / 2, -size / 2);

    // Draw image
    const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
    const sourceX = (image.naturalWidth - sourceSize) / 2;
    const sourceY = (image.naturalHeight - sourceSize) / 2;

    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      crop.x,
      crop.y,
      size,
      size
    );

    // Restore context
    ctx.restore();

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleSave = () => {
    if (selectedFile) {
      const croppedDataUrl = getCroppedImage();
      onPhotoChange(selectedFile, croppedDataUrl);
      setIsModalOpen(false);
      setImageUrl('');
      setSelectedFile(null);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setImageUrl('');
    setSelectedFile(null);
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
  };

  return (
    <>
      <div className={`relative ${className}`}>
        <div
          className={`
            ${sizes[size]} rounded-full border-4 border-white shadow-lg overflow-hidden
            bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center
            cursor-pointer hover:scale-105 transition-all duration-300 group
          `}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {currentPhoto ? (
            <img
              src={currentPhoto}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <Camera className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Upload className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Remove button */}
        {currentPhoto && onPhotoRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPhotoRemove();
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Crop Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCancel}
        title="Crop Profile Photo"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Photo
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          {/* Crop Area */}
          <div className="relative">
            <div
              className="relative w-80 h-80 mx-auto border-2 border-gray-300 rounded-lg overflow-hidden cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {imageUrl && (
                <>
                  <img
                    ref={imageRef}
                    src={imageUrl}
                    alt="Crop preview"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    style={{
                      transform: `translate(${crop.x}px, ${crop.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                      transformOrigin: 'center'
                    }}
                  />
                  
                  {/* Crop overlay */}
                  <div className="absolute inset-0 border-4 border-white/50 rounded-full pointer-events-none" />
                  <div className="absolute inset-4 border-2 border-blue-500 rounded-full pointer-events-none" />
                </>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Zoom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zoom: {zoom.toFixed(1)}x
              </label>
              <div className="flex items-center space-x-4">
                <ZoomOut className="w-4 h-4 text-gray-400" />
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <ZoomIn className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Rotation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rotation: {rotation}°
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="1"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="flex-1"
                />
                <button
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Preview</p>
            <div className="w-24 h-24 mx-auto rounded-full border-2 border-gray-300 overflow-hidden">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-cover"
                style={{ display: 'none' }}
              />
              {imageUrl && (
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${imageUrl})`,
                    backgroundPosition: `${-crop.x}px ${-crop.y}px`,
                    backgroundSize: `${zoom * 100}%`,
                    transform: `rotate(${rotation}deg)`
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};