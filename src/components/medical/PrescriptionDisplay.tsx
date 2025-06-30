import React from 'react';
import { Pill, Clock, AlertTriangle, Calendar, User, FileText, Download, Printer, RefreshCw, Eye, Edit } from 'lucide-react';
import { Button } from '../ui/Button';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  warnings?: string[];
  prescribedBy: string;
  prescribedDate: string;
  refillsRemaining?: number;
  status: 'active' | 'completed' | 'discontinued';
}

export interface PrescriptionDisplayProps {
  medications: Medication[];
  variant?: 'card' | 'list' | 'detailed';
  showPrescriber?: boolean;
  onMedicationClick?: (medication: Medication) => void;
  onRenew?: (medication: Medication) => void;
  onPrint?: (medication: Medication) => void;
  onDownload?: (medication: Medication) => void;
  className?: string;
}

export const PrescriptionDisplay: React.FC<PrescriptionDisplayProps> = ({
  medications,
  variant = 'card',
  showPrescriber = true,
  onMedicationClick,
  onRenew,
  onPrint,
  onDownload,
  className = ''
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'discontinued':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  if (variant === 'list') {
    return (
      <div className={`space-y-2 ${className}`}>
        {medications.map((medication) => (
          <div
            key={medication.id}
            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-300 cursor-pointer"
            onClick={() => onMedicationClick?.(medication)}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Pill className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{medication.name}</h4>
                <p className="text-sm text-gray-600">{medication.dosage} - {medication.frequency}</p>
              </div>
            </div>
            
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(medication.status)}`}>
              {medication.status.charAt(0).toUpperCase() + medication.status.slice(1)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`space-y-6 ${className}`}>
        {medications.map((medication) => (
          <div
            key={medication.id}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => onMedicationClick?.(medication)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Pill className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{medication.name}</h3>
                  <p className="text-gray-600">{medication.dosage}</p>
                </div>
              </div>
              
              <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(medication.status)}`}>
                {medication.status.charAt(0).toUpperCase() + medication.status.slice(1)}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  <strong>Frequency:</strong> {medication.frequency}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  <strong>Duration:</strong> {medication.duration}
                </span>
              </div>
              
              {showPrescriber && (
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    <strong>Prescribed by:</strong> {medication.prescribedBy}
                  </span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  <strong>Date:</strong> {new Date(medication.prescribedDate).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            {medication.instructions && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {medication.instructions}
                </p>
              </div>
            )}
            
            {medication.warnings && medication.warnings.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span>Warnings:</span>
                </h4>
                <ul className="space-y-1">
                  {medication.warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {medication.refillsRemaining !== undefined && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">
                  <strong>Refills remaining:</strong> {medication.refillsRemaining}
                </span>
                {medication.refillsRemaining === 0 && (
                  <span className="text-sm text-red-600 font-medium">Contact doctor for refill</span>
                )}
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                icon={Eye}
                onClick={(e) => {
                  e.stopPropagation();
                  onMedicationClick?.(medication);
                }}
              >
                View Details
              </Button>
              
              {medication.status === 'active' && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={RefreshCw}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRenew?.(medication);
                  }}
                >
                  Renew
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                icon={Printer}
                onClick={(e) => {
                  e.stopPropagation();
                  onPrint?.(medication);
                }}
              >
                Print
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                icon={Download}
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload?.(medication);
                }}
              >
                Download
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default card variant
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {medications.map((medication) => (
        <div
          key={medication.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 cursor-pointer"
          onClick={() => onMedicationClick?.(medication)}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Pill className="w-5 h-5 text-blue-600" />
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(medication.status)}`}>
              {medication.status.charAt(0).toUpperCase() + medication.status.slice(1)}
            </span>
          </div>
          
          <h3 className="font-semibold text-gray-900 mb-1">{medication.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{medication.dosage} - {medication.frequency}</p>
          
          <div className="space-y-1 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{medication.frequency}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{medication.duration}</span>
            </div>
            {showPrescriber && (
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{medication.prescribedBy}</span>
              </div>
            )}
          </div>
          
          {medication.warnings && medication.warnings.length > 0 && (
            <div className="mt-2 flex items-center space-x-2 text-yellow-600">
              <AlertTriangle className="w-3 h-3" />
              <span className="text-xs">Has warnings</span>
            </div>
          )}
          
          {medication.refillsRemaining !== undefined && medication.refillsRemaining === 0 && (
            <div className="mt-2 flex items-center space-x-2 text-red-600">
              <AlertTriangle className="w-3 h-3" />
              <span className="text-xs">No refills remaining</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};