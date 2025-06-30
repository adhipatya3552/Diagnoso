import React from 'react';
import { Pill, Star, Copy, Edit, Trash2, Clock, User, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';

export interface PrescriptionTemplateProps {
  id: string;
  name: string;
  description?: string;
  medications: Array<{
    name: string;
    strength: string;
    form: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
    isGeneric: boolean;
  }>;
  category: string;
  isStarred: boolean;
  usageCount: number;
  lastUsed?: string;
  onApply: (id: string) => void;
  onEdit?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleStar?: (id: string) => void;
  className?: string;
}

export const PrescriptionTemplate: React.FC<PrescriptionTemplateProps> = ({
  id,
  name,
  description,
  medications,
  category,
  isStarred,
  usageCount,
  lastUsed,
  onApply,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleStar,
  className = ''
}) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-300 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Pill className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{name}</h3>
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}
          </div>
        </div>
        
        <button
          onClick={() => onToggleStar?.(id)}
          className={`p-1 rounded-full transition-colors ${
            isStarred 
              ? 'text-yellow-500 hover:bg-yellow-50' 
              : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100'
          }`}
        >
          <Star className={`w-5 h-5 ${isStarred ? 'fill-current' : ''}`} />
        </button>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Medications</span>
          <span className="text-xs text-gray-500">{medications.length} total</span>
        </div>
        
        <div className="space-y-2">
          {medications.slice(0, 2).map((medication, index) => (
            <div key={index} className="p-2 bg-gray-50 rounded-lg text-sm">
              <p className="font-medium text-gray-800">
                {medication.name} {medication.strength}
              </p>
              <p className="text-xs text-gray-600">
                {medication.dosage}, {medication.frequency}, {medication.duration}
              </p>
            </div>
          ))}
          
          {medications.length > 2 && (
            <p className="text-xs text-center text-gray-500">
              +{medications.length - 2} more medications
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
          {category}
        </span>
        
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Used {usageCount} times</span>
          </div>
          
          {lastUsed && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>Last: {new Date(lastUsed).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onApply(id)}
        >
          Apply
        </Button>
        
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            icon={Edit}
            onClick={() => onEdit(id)}
          >
            Edit
          </Button>
        )}
        
        {onDuplicate && (
          <Button
            variant="outline"
            size="sm"
            icon={Copy}
            onClick={() => onDuplicate(id)}
          >
            Duplicate
          </Button>
        )}
        
        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            icon={Trash2}
            onClick={() => onDelete(id)}
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};