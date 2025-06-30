import React, { useRef } from 'react';
import { Button } from '../ui/Button';
import { Download, Printer, Share2, Copy } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

interface PrescriptionPDFProps {
  prescriptionData: {
    id: string;
    patient: {
      name: string;
      dateOfBirth?: string;
      address?: string;
    };
    doctor: {
      name: string;
      license: string;
      signature?: string;
    };
    clinic: {
      name: string;
      address: string;
      phone: string;
      logo?: string;
    };
    date: string;
    expiryDate: string;
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
    refills: number;
    notes?: string;
  };
  onDownload?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
  className?: string;
}

export const PrescriptionPDF: React.FC<PrescriptionPDFProps> = ({
  prescriptionData,
  onDownload,
  onPrint,
  onShare,
  className = ''
}) => {
  const { success } = useToast();
  const pdfRef = useRef<HTMLDivElement>(null);
  
  const handleCopyToClipboard = () => {
    // In a real app, you would generate a shareable link
    success('Prescription link copied to clipboard');
  };
  
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };
  
  return (
    <div className={className}>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* PDF Controls */}
        <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Prescription #{prescriptionData.id}</h3>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              icon={Copy}
              onClick={handleCopyToClipboard}
            >
              Copy Link
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              icon={Share2}
              onClick={onShare}
            >
              Share
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              icon={Printer}
              onClick={handlePrint}
            >
              Print
            </Button>
            
            <Button
              variant="primary"
              size="sm"
              icon={Download}
              onClick={onDownload}
            >
              Download
            </Button>
          </div>
        </div>
        
        {/* PDF Content */}
        <div 
          ref={pdfRef}
          className="p-8 max-w-4xl mx-auto"
          id="prescription-pdf"
        >
          {/* Letterhead */}
          <div className="flex justify-between items-center pb-6 border-b-2 border-gray-200 mb-6">
            <div className="flex items-center space-x-3">
              {prescriptionData.clinic.logo ? (
                <img 
                  src={prescriptionData.clinic.logo} 
                  alt={prescriptionData.clinic.name} 
                  className="h-16 w-auto"
                />
              ) : (
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {prescriptionData.clinic.name.charAt(0)}
                  </span>
                </div>
              )}
              
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{prescriptionData.clinic.name}</h2>
                <p className="text-gray-600">{prescriptionData.clinic.address}</p>
                <p className="text-gray-600">Phone: {prescriptionData.clinic.phone}</p>
              </div>
            </div>
            
            <div className="text-right">
              <h3 className="text-xl font-bold text-gray-800 uppercase">Prescription</h3>
              <p className="text-gray-600">Date: {new Date(prescriptionData.date).toLocaleDateString()}</p>
              <p className="text-gray-600">Expires: {new Date(prescriptionData.expiryDate).toLocaleDateString()}</p>
            </div>
          </div>
          
          {/* Patient Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Patient Information</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-800">{prescriptionData.patient.name}</p>
              {prescriptionData.patient.dateOfBirth && (
                <p className="text-gray-600">DOB: {new Date(prescriptionData.patient.dateOfBirth).toLocaleDateString()}</p>
              )}
              {prescriptionData.patient.address && (
                <p className="text-gray-600">Address: {prescriptionData.patient.address}</p>
              )}
            </div>
          </div>
          
          {/* Medications */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Medications</h3>
            <div className="space-y-4">
              {prescriptionData.medications.map((medication, index) => (
                <div key={index} className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-800">
                        {index + 1}. {medication.name} {medication.strength} {medication.form}
                        {!medication.isGeneric && ' (Dispense as written)'}
                      </p>
                      
                      <div className="mt-2 text-gray-600">
                        <p>
                          <span className="font-medium">Sig:</span> {medication.dosage} {medication.frequency} for {medication.duration}
                        </p>
                        {medication.instructions && (
                          <p className="mt-1">
                            <span className="font-medium">Instructions:</span> {medication.instructions}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {medication.isGeneric ? (
                      <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Generic Substitution Allowed
                      </div>
                    ) : (
                      <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Dispense As Written
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Additional Information */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Refills</h4>
                <p className="text-gray-600">
                  {prescriptionData.refills === 0 
                    ? 'No refills' 
                    : `${prescriptionData.refills} refill${prescriptionData.refills !== 1 ? 's' : ''}`
                  }
                </p>
              </div>
              
              {prescriptionData.notes && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Notes</h4>
                  <p className="text-gray-600">{prescriptionData.notes}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Signature */}
          <div className="mt-12 pt-6 border-t border-gray-200">
            <div className="flex justify-between">
              <div>
                {prescriptionData.doctor.signature ? (
                  <img 
                    src={prescriptionData.doctor.signature} 
                    alt="Doctor's Signature" 
                    className="h-16 w-auto mb-2"
                  />
                ) : (
                  <div className="w-48 h-16 border-b border-gray-400"></div>
                )}
                <p className="text-gray-600">Physician Signature</p>
              </div>
              
              <div className="text-right">
                <p className="font-medium text-gray-800">{prescriptionData.doctor.name}</p>
                <p className="text-gray-600">License #: {prescriptionData.doctor.license}</p>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-12 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
            <p>This prescription is electronically generated and may be filled at any pharmacy.</p>
            <p>Prescription ID: {prescriptionData.id} • Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};