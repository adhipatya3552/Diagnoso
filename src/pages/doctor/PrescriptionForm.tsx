import React, { useState, useEffect } from 'react';
import { Pill, User, Calendar, Clock, Plus, Trash2, Save, FileText, Download, Printer, Send, BookTemplate as Template, Star, X, Check, AlertTriangle, Info, ChevronDown, ChevronUp, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../lib/supabase';
import { MedicationSearch } from '../../components/medical/MedicationSearch';
import { PrescriptionTemplateLibrary } from '../../components/medical/PrescriptionTemplateLibrary';
import { PrescriptionPDF } from '../../components/medical/PrescriptionPDF';

interface Medication {
  id: string;
  name: string;
  genericName?: string;
  strength: string;
  form: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  isGeneric: boolean;
  interactions?: string[];
  warnings?: string[];
}

interface Patient {
  id: string;
  name: string;
  email: string;
  dateOfBirth?: string;
  address?: string;
  profile_photo_url?: string;
  allergies?: string[];
  currentMedications?: string[];
}

export const PrescriptionForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error, info } = useToast();
  
  // Form state
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [prescriptionDate, setPrescriptionDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [refills, setRefills] = useState(0);
  const [notes, setNotes] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateCategory, setTemplateCategory] = useState('');
  const [showWarnings, setShowWarnings] = useState(false);
  const [interactionWarnings, setInteractionWarnings] = useState<string[]>([]);
  const [allergyWarnings, setAllergyWarnings] = useState<string[]>([]);
  
  // Calculate default expiry date (30 days from now)
  useEffect(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    setExpiryDate(date.toISOString().split('T')[0]);
  }, []);
  
  // Load patients
  useEffect(() => {
    const fetchPatients = async () => {
      if (!user) return;
      
      try {
        // In a real app, fetch from Supabase
        // const { data, error } = await supabase
        //   .from('users')
        //   .select(`
        //     *,
        //     patient_profiles(allergies, current_medications)
        //   `)
        //   .eq('role', 'patient');
        
        // For demo, use mock data
        const mockPatients: Patient[] = [
          {
            id: '1',
            name: 'John Smith',
            email: 'john.smith@example.com',
            dateOfBirth: '1980-05-15',
            profile_photo_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            allergies: ['Penicillin', 'Sulfa drugs'],
            currentMedications: ['Lisinopril 10mg', 'Atorvastatin 20mg']
          },
          {
            id: '2',
            name: 'Maria Garcia',
            email: 'maria.garcia@example.com',
            dateOfBirth: '1975-08-22',
            profile_photo_url: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            allergies: ['Aspirin'],
            currentMedications: ['Metformin 500mg']
          },
          {
            id: '3',
            name: 'David Wilson',
            email: 'david.wilson@example.com',
            dateOfBirth: '1990-03-10',
            allergies: [],
            currentMedications: []
          }
        ];
        
        setPatients(mockPatients);
      } catch (err) {
        console.error('Error fetching patients:', err);
      }
    };
    
    fetchPatients();
  }, [user]);
  
  // Check for drug interactions and allergies
  useEffect(() => {
    if (medications.length === 0 || !selectedPatient) return;
    
    // Check for interactions between medications
    const interactions: string[] = [];
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const med1 = medications[i];
        const med2 = medications[j];
        
        // In a real app, you would check against a drug interaction database
        // For demo, check if either medication has the other in its interactions list
        if (med1.interactions?.includes(med2.name) || med2.interactions?.includes(med1.name)) {
          interactions.push(`Potential interaction between ${med1.name} and ${med2.name}`);
        }
      }
    }
    
    // Check for allergies
    const allergies: string[] = [];
    if (selectedPatient.allergies) {
      for (const medication of medications) {
        for (const allergy of selectedPatient.allergies) {
          if (
            medication.name.toLowerCase().includes(allergy.toLowerCase()) ||
            medication.genericName?.toLowerCase().includes(allergy.toLowerCase())
          ) {
            allergies.push(`Patient is allergic to ${allergy}, which may be present in ${medication.name}`);
          }
        }
      }
    }
    
    setInteractionWarnings(interactions);
    setAllergyWarnings(allergies);
    
    // Show warnings if any are found
    if (interactions.length > 0 || allergies.length > 0) {
      setShowWarnings(true);
    }
  }, [medications, selectedPatient]);
  
  const handleAddMedication = (medication: Medication) => {
    // Add default values for dosage, frequency, and duration if not provided
    const newMedication = {
      ...medication,
      dosage: medication.dosage || '1 tablet',
      frequency: medication.frequency || 'once daily',
      duration: medication.duration || '30 days'
    };
    
    setMedications(prev => [...prev, newMedication]);
  };
  
  const handleRemoveMedication = (index: number) => {
    setMedications(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleUpdateMedication = (index: number, field: keyof Medication, value: string | boolean) => {
    setMedications(prev => 
      prev.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    );
  };
  
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientSearch(false);
  };
  
  const handleApplyTemplate = (template: any) => {
    // Apply template medications
    setMedications(template.medications);
    setShowTemplateLibrary(false);
    
    // Update template usage count
    // In a real app, you would update this in the database
    success(`Template "${template.name}" applied`);
  };
  
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      error('Template name is required');
      return;
    }
    
    if (medications.length === 0) {
      error('Add at least one medication to save as template');
      return;
    }
    
    setLoading(true);
    try {
      // In a real app, save to Supabase
      // const { data, error: saveError } = await supabase
      //   .from('prescription_templates')
      //   .insert({
      //     name: templateName,
      //     description: templateDescription,
      //     medications: medications,
      //     category: templateCategory || 'General',
      //     created_by: user?.id
      //   });
      
      // For demo, just show success message
      setTimeout(() => {
        success('Template saved successfully');
        setShowSaveTemplateModal(false);
        setTemplateName('');
        setTemplateDescription('');
        setTemplateCategory('');
      }, 1000);
    } catch (err) {
      console.error('Error saving template:', err);
      error('Failed to save template');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSavePrescription = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // In a real app, save to Supabase
      // const { data, error: saveError } = await supabase
      //   .from('prescriptions')
      //   .insert({
      //     patient_id: selectedPatient?.id,
      //     doctor_id: user?.id,
      //     prescription_date: prescriptionDate,
      //     expiry_date: expiryDate,
      //     medications: medications,
      //     notes: notes,
      //     refills: refills,
      //     refills_used: 0,
      //     status: 'active'
      //   });
      
      // For demo, just show success message
      setTimeout(() => {
        success('Prescription saved successfully');
        navigate('/doctor/prescriptions');
      }, 1500);
    } catch (err) {
      console.error('Error saving prescription:', err);
      error('Failed to save prescription');
    } finally {
      setLoading(false);
    }
  };
  
  const validateForm = (): boolean => {
    if (!selectedPatient) {
      error('Please select a patient');
      return false;
    }
    
    if (medications.length === 0) {
      error('Please add at least one medication');
      return false;
    }
    
    if (!prescriptionDate) {
      error('Please select a prescription date');
      return false;
    }
    
    if (!expiryDate) {
      error('Please select an expiry date');
      return false;
    }
    
    // Check if expiry date is after prescription date
    if (new Date(expiryDate) <= new Date(prescriptionDate)) {
      error('Expiry date must be after prescription date');
      return false;
    }
    
    return true;
  };
  
  const handlePrintPrescription = () => {
    if (!validateForm()) return;
    
    info('Preparing prescription for printing...');
    // In a real app, you would generate a PDF and print it
    setTimeout(() => {
      success('Prescription sent to printer');
    }, 1500);
  };
  
  const handleDownloadPrescription = () => {
    if (!validateForm()) return;
    
    info('Preparing prescription for download...');
    // In a real app, you would generate a PDF and download it
    setTimeout(() => {
      success('Prescription downloaded successfully');
    }, 1500);
  };
  
  const handleSendPrescription = () => {
    if (!validateForm()) return;
    
    info('Sending prescription to patient...');
    // In a real app, you would send the prescription to the patient
    setTimeout(() => {
      success('Prescription sent to patient');
    }, 1500);
  };
  
  // Filter patients based on search term
  const filteredPatients = patientSearchTerm
    ? patients.filter(patient => 
        patient.name.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(patientSearchTerm.toLowerCase())
      )
    : patients;
  
  // Prepare prescription data for PDF preview
  const prescriptionData = {
    id: 'NEW',
    patient: {
      name: selectedPatient?.name || 'Select a patient',
      dateOfBirth: selectedPatient?.dateOfBirth,
      address: selectedPatient?.address
    },
    doctor: {
      name: user?.name || 'Doctor',
      license: 'MD12345', // In a real app, get from doctor profile
      signature: undefined // In a real app, get from doctor profile
    },
    clinic: {
      name: 'Diagnosa Medical Center',
      address: '123 Health St, Medical City, CA 90210',
      phone: '(555) 123-4567',
      logo: undefined
    },
    date: prescriptionDate,
    expiryDate: expiryDate,
    medications: medications.map(med => ({
      name: med.name,
      strength: med.strength,
      form: med.form,
      dosage: med.dosage,
      frequency: med.frequency,
      duration: med.duration,
      instructions: med.instructions,
      isGeneric: med.isGeneric
    })),
    refills: refills,
    notes: notes
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Create Prescription</h1>
            <p className="text-gray-600 mt-2">Prescribe medications for your patients</p>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowTemplateLibrary(true)}
              icon={Template}
            >
              Templates
            </Button>
            
            <Button
              variant="primary"
              onClick={handleSavePrescription}
              loading={loading}
              icon={Save}
            >
              Save Prescription
            </Button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Patient Selection */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <User className="w-5 h-5 text-purple-600 mr-2" />
                Patient Information
              </h2>
              
              {selectedPatient ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {selectedPatient.profile_photo_url ? (
                      <img
                        src={selectedPatient.profile_photo_url}
                        alt={selectedPatient.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-purple-600" />
                      </div>
                    )}
                    
                    <div>
                      <h3 className="font-semibold text-gray-800">{selectedPatient.name}</h3>
                      <p className="text-sm text-gray-600">{selectedPatient.email}</p>
                      {selectedPatient.dateOfBirth && (
                        <p className="text-sm text-gray-600">
                          DOB: {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPatientSearch(true)}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setShowPatientSearch(true)}
                  icon={User}
                >
                  Select Patient
                </Button>
              )}
              
              {/* Patient Allergies & Current Medications */}
              {selectedPatient && (selectedPatient.allergies?.length || selectedPatient.currentMedications?.length) && (
                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Known Allergies</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPatient.allergies.map((allergy, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                          >
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedPatient.currentMedications && selectedPatient.currentMedications.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Current Medications</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPatient.currentMedications.map((medication, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {medication}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Medications */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Pill className="w-5 h-5 text-purple-600 mr-2" />
                Medications
              </h2>
              
              {/* Medication Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search and Add Medications
                </label>
                <MedicationSearch
                  onSelect={handleAddMedication}
                  placeholder="Search by medication name..."
                />
              </div>
              
              {/* Medication List */}
              <div className="space-y-4">
                {medications.map((medication, index) => (
                  <div key={index} className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Pill className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {medication.name} {medication.strength} {medication.form}
                          </h3>
                          {medication.genericName && medication.genericName !== medication.name && (
                            <p className="text-sm text-gray-600">
                              Generic: {medication.genericName}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleRemoveMedication(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dosage
                        </label>
                        <input
                          type="text"
                          value={medication.dosage}
                          onChange={(e) => handleUpdateMedication(index, 'dosage', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          placeholder="e.g., 1 tablet"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Frequency
                        </label>
                        <select
                          value={medication.frequency}
                          onChange={(e) => handleUpdateMedication(index, 'frequency', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        >
                          <option value="once daily">Once daily</option>
                          <option value="twice daily">Twice daily</option>
                          <option value="three times daily">Three times daily</option>
                          <option value="four times daily">Four times daily</option>
                          <option value="every 4 hours">Every 4 hours</option>
                          <option value="every 6 hours">Every 6 hours</option>
                          <option value="every 8 hours">Every 8 hours</option>
                          <option value="every 12 hours">Every 12 hours</option>
                          <option value="as needed">As needed (PRN)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration
                        </label>
                        <select
                          value={medication.duration}
                          onChange={(e) => handleUpdateMedication(index, 'duration', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        >
                          <option value="3 days">3 days</option>
                          <option value="5 days">5 days</option>
                          <option value="7 days">7 days</option>
                          <option value="10 days">10 days</option>
                          <option value="14 days">14 days</option>
                          <option value="30 days">30 days</option>
                          <option value="60 days">60 days</option>
                          <option value="90 days">90 days</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Generic Substitution
                        </label>
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              checked={medication.isGeneric}
                              onChange={() => handleUpdateMedication(index, 'isGeneric', true)}
                              className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">Allow generic</span>
                          </label>
                          
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              checked={!medication.isGeneric}
                              onChange={() => handleUpdateMedication(index, 'isGeneric', false)}
                              className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">Dispense as written</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Special Instructions (Optional)
                      </label>
                      <textarea
                        value={medication.instructions || ''}
                        onChange={(e) => handleUpdateMedication(index, 'instructions', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        placeholder="Additional instructions for patient..."
                      />
                    </div>
                    
                    {/* Warnings */}
                    {medication.warnings && medication.warnings.length > 0 && (
                      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <h4 className="text-sm font-medium text-amber-800">Warnings</h4>
                        </div>
                        <ul className="space-y-1">
                          {medication.warnings.map((warning, i) => (
                            <li key={i} className="text-xs text-amber-700">• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
                
                {medications.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No medications added yet</p>
                    <p className="text-sm text-gray-400 mb-4">
                      Search for medications above to add them to this prescription
                    </p>
                  </div>
                )}
                
                {/* Add Medication Button */}
                <button
                  onClick={() => document.querySelector<HTMLInputElement>('input[placeholder="Search by medication name..."]')?.focus()}
                  className="w-full py-3 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Another Medication</span>
                </button>
              </div>
            </div>
            
            {/* Prescription Details */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="w-5 h-5 text-purple-600 mr-2" />
                Prescription Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prescription Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={prescriptionDate}
                      onChange={(e) => setPrescriptionDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      min={prescriptionDate}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refills
                  </label>
                  <select
                    value={refills}
                    onChange={(e) => setRefills(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="0">No refills</option>
                    <option value="1">1 refill</option>
                    <option value="2">2 refills</option>
                    <option value="3">3 refills</option>
                    <option value="5">5 refills</option>
                    <option value="11">11 refills (1 year supply)</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="Additional notes for the prescription..."
                />
              </div>
            </div>
            
            {/* Warning Alerts */}
            {showWarnings && (interactionWarnings.length > 0 || allergyWarnings.length > 0) && (
              <div className="bg-amber-50 rounded-xl p-6 border border-amber-200 shadow-lg animate-fade-in">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-amber-800 mb-2">Prescription Warnings</h3>
                    
                    {allergyWarnings.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-amber-800 mb-2">Allergy Warnings</h4>
                        <ul className="space-y-1">
                          {allergyWarnings.map((warning, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-red-700">{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {interactionWarnings.length > 0 && (
                      <div>
                        <h4 className="font-medium text-amber-800 mb-2">Drug Interaction Warnings</h4>
                        <ul className="space-y-1">
                          {interactionWarnings.map((warning, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-amber-700">{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowWarnings(false)}
                      >
                        Acknowledge
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={handleSavePrescription}
                loading={loading}
                icon={Save}
              >
                Save Prescription
              </Button>
              
              <Button
                variant="outline"
                onClick={handlePrintPrescription}
                icon={Printer}
              >
                Print
              </Button>
              
              <Button
                variant="outline"
                onClick={handleDownloadPrescription}
                icon={Download}
              >
                Download PDF
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSendPrescription}
                icon={Send}
              >
                Send to Patient
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowSaveTemplateModal(true)}
                icon={Star}
              >
                Save as Template
              </Button>
            </div>
          </div>
          
          {/* Right Column - Preview */}
          <div>
            <div className="sticky top-24">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Prescription Preview</h2>
              <PrescriptionPDF
                prescriptionData={prescriptionData}
                onDownload={handleDownloadPrescription}
                onPrint={handlePrintPrescription}
                onShare={handleSendPrescription}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Patient Search Modal */}
      <Modal
        isOpen={showPatientSearch}
        onClose={() => setShowPatientSearch(false)}
        title="Select Patient"
        size="md"
      >
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={patientSearchTerm}
              onChange={(e) => setPatientSearchTerm(e.target.value)}
              placeholder="Search patients by name or email..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {filteredPatients.length > 0 ? (
              <div className="space-y-2">
                {filteredPatients.map(patient => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <div className="flex items-center space-x-3">
                      {patient.profile_photo_url ? (
                        <img
                          src={patient.profile_photo_url}
                          alt={patient.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-purple-600" />
                        </div>
                      )}
                      
                      <div>
                        <p className="font-medium text-gray-800">{patient.name}</p>
                        <p className="text-sm text-gray-600">{patient.email}</p>
                      </div>
                    </div>
                    
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No patients found</p>
                {patientSearchTerm && (
                  <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>
      
      {/* Template Library Modal */}
      <Modal
        isOpen={showTemplateLibrary}
        onClose={() => setShowTemplateLibrary(false)}
        title="Prescription Templates"
        size="xl"
      >
        <PrescriptionTemplateLibrary
          onSelectTemplate={handleApplyTemplate}
          onCreateTemplate={() => {
            setShowTemplateLibrary(false);
            setShowSaveTemplateModal(true);
          }}
        />
      </Modal>
      
      {/* Save Template Modal */}
      <Modal
        isOpen={showSaveTemplateModal}
        onClose={() => setShowSaveTemplateModal(false)}
        title="Save as Template"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name
            </label>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Enter a name for this template"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              placeholder="Describe what this template is for..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={templateCategory}
              onChange={(e) => setTemplateCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="">Select a category</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Endocrinology">Endocrinology</option>
              <option value="General Practice">General Practice</option>
              <option value="Neurology">Neurology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Psychiatry">Psychiatry</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => setShowSaveTemplateModal(false)}
            >
              Cancel
            </Button>
            
            <Button
              variant="primary"
              onClick={handleSaveTemplate}
              loading={loading}
              icon={Save}
            >
              Save Template
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};