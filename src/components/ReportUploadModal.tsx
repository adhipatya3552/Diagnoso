import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { FileUpload } from './ui/FileUpload';
import { X, Upload, FileText, Image, AlertCircle, Check } from 'lucide-react';
import { Input } from './ui/Input';

interface ReportUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (reportData: ReportData) => Promise<void>;
}

export interface ReportData {
  files: File[];
  title: string;
  category: string;
  description: string;
  tags: string[];
}

export const ReportUploadModal: React.FC<ReportUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const categories = [
    'Lab Results',
    'Imaging',
    'Consultation Notes',
    'Prescriptions',
    'Medical History',
    'Vaccination Records',
    'Insurance Documents',
    'Other'
  ];
  
  const handleFilesChange = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    setErrors(prev => ({ ...prev, files: '' }));
    
    // Auto-detect title from filename if not set
    if (!title && newFiles.length > 0) {
      const fileName = newFiles[0].name;
      // Remove extension and replace underscores/hyphens with spaces
      const cleanName = fileName.split('.').slice(0, -1).join('.').replace(/[_-]/g, ' ');
      // Capitalize first letter of each word
      const formattedName = cleanName.replace(/\b\w/g, l => l.toUpperCase());
      setTitle(formattedName);
    }
  };
  
  const handleFileError = (error: string) => {
    setErrors(prev => ({ ...prev, files: error }));
  };
  
  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (files.length === 0) {
      newErrors.files = 'Please upload at least one file';
    }
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!category) {
      newErrors.category = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await onUpload({
        files,
        title,
        category,
        description,
        tags
      });
      
      setSuccess(true);
      setTimeout(() => {
        resetForm();
        onClose();
      }, 2000);
    } catch (err) {
      setErrors(prev => ({ ...prev, submit: 'Failed to upload report. Please try again.' }));
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setFiles([]);
    setTitle('');
    setCategory('');
    setDescription('');
    setTags([]);
    setTagInput('');
    setErrors({});
    setSuccess(false);
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Upload Medical Report"
      size="lg"
    >
      <div className="space-y-6">
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload Successful!</h3>
            <p className="text-gray-600">Your medical report has been uploaded successfully.</p>
          </div>
        ) : (
          <>
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Files
              </label>
              <FileUpload
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                multiple={true}
                maxSize={20 * 1024 * 1024} // 20MB
                onFilesChange={handleFilesChange}
                onError={handleFileError}
              />
              {errors.files && (
                <p className="text-red-500 text-sm mt-1">{errors.files}</p>
              )}
              
              {/* Selected Files */}
              {files.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files</h4>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          {file.type.startsWith('image/') ? (
                            <Image className="w-5 h-5 text-blue-500" />
                          ) : (
                            <FileText className="w-5 h-5 text-red-500" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-800 truncate max-w-xs">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Report Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Title
                </label>
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrors(prev => ({ ...prev, title: '' }));
                  }}
                  placeholder="Enter report title"
                  error={errors.title}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setErrors(prev => ({ ...prev, category: '' }));
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.category ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 focus:ring-blue-500/50'
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Add a description of this medical report..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (Optional)
              </label>
              <div className="flex space-x-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tags (press Enter)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                >
                  Add
                </Button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
              >
                Cancel
              </Button>
              
              <Button
                variant="primary"
                icon={Upload}
                loading={loading}
                onClick={handleSubmit}
              >
                Upload Report
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};