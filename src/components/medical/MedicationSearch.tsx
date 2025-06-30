import React, { useState, useEffect } from 'react';
import { Search, X, AlertTriangle, DollarSign, Pill, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

interface Medication {
  id: string;
  name: string;
  genericName?: string;
  brandNames?: string[];
  strength: string;
  form: string;
  commonDosages: string[];
  interactions?: string[];
  sideEffects?: string[];
  warnings?: string[];
  price?: {
    retail: number;
    generic?: number;
  };
  requiresPriorAuth?: boolean;
  controlled?: boolean;
  schedule?: string;
  imageUrl?: string;
}

interface MedicationSearchProps {
  onSelect: (medication: Medication) => void;
  onError?: (error: string) => void;
  placeholder?: string;
  className?: string;
}

export const MedicationSearch: React.FC<MedicationSearchProps> = ({
  onSelect,
  onError,
  placeholder = 'Search medications...',
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [expandedMedication, setExpandedMedication] = useState<string | null>(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Mock medications database
  const mockMedications: Medication[] = [
    {
      id: '1',
      name: 'Lisinopril',
      genericName: 'Lisinopril',
      brandNames: ['Prinivil', 'Zestril'],
      strength: '10mg',
      form: 'Tablet',
      commonDosages: ['10mg once daily', '20mg once daily', '40mg once daily'],
      interactions: ['Potassium supplements', 'Lithium', 'NSAIDs'],
      sideEffects: ['Dry cough', 'Dizziness', 'Headache'],
      warnings: ['May cause birth defects if taken during pregnancy'],
      price: {
        retail: 15.99,
        generic: 4.99
      },
      imageUrl: 'https://www.drugs.com/images/pills/nlm/167140243.jpg'
    },
    {
      id: '2',
      name: 'Metformin',
      genericName: 'Metformin',
      brandNames: ['Glucophage', 'Fortamet'],
      strength: '500mg',
      form: 'Tablet',
      commonDosages: ['500mg twice daily', '1000mg twice daily'],
      interactions: ['Alcohol', 'Contrast dyes'],
      sideEffects: ['Nausea', 'Diarrhea', 'Stomach upset'],
      warnings: ['May cause lactic acidosis in patients with kidney disease'],
      price: {
        retail: 25.99,
        generic: 8.99
      },
      imageUrl: 'https://www.drugs.com/images/pills/nlm/167140243.jpg'
    },
    {
      id: '3',
      name: 'Atorvastatin',
      genericName: 'Atorvastatin',
      brandNames: ['Lipitor'],
      strength: '20mg',
      form: 'Tablet',
      commonDosages: ['10mg once daily', '20mg once daily', '40mg once daily'],
      interactions: ['Grapefruit juice', 'Certain antibiotics', 'Antifungals'],
      sideEffects: ['Muscle pain', 'Liver problems', 'Digestive issues'],
      warnings: ['May cause liver damage'],
      price: {
        retail: 45.99,
        generic: 12.99
      },
      imageUrl: 'https://www.drugs.com/images/pills/nlm/167140243.jpg'
    },
    {
      id: '4',
      name: 'Amoxicillin',
      genericName: 'Amoxicillin',
      brandNames: ['Amoxil'],
      strength: '500mg',
      form: 'Capsule',
      commonDosages: ['500mg three times daily', '875mg twice daily'],
      interactions: ['Probenecid', 'Allopurinol'],
      sideEffects: ['Diarrhea', 'Rash', 'Nausea'],
      warnings: ['May cause allergic reactions in penicillin-sensitive individuals'],
      price: {
        retail: 18.99,
        generic: 6.99
      },
      controlled: false,
      imageUrl: 'https://www.drugs.com/images/pills/nlm/167140243.jpg'
    },
    {
      id: '5',
      name: 'Hydrocodone/Acetaminophen',
      genericName: 'Hydrocodone/Acetaminophen',
      brandNames: ['Vicodin', 'Norco'],
      strength: '5/325mg',
      form: 'Tablet',
      commonDosages: ['1-2 tablets every 4-6 hours as needed'],
      interactions: ['Alcohol', 'Benzodiazepines', 'Other opioids'],
      sideEffects: ['Drowsiness', 'Constipation', 'Nausea'],
      warnings: ['May be habit-forming', 'Can cause respiratory depression'],
      price: {
        retail: 35.99,
        generic: 15.99
      },
      controlled: true,
      schedule: 'II',
      requiresPriorAuth: true,
      imageUrl: 'https://www.drugs.com/images/pills/nlm/167140243.jpg'
    }
  ];
  
  // Search for medications when search term changes
  useEffect(() => {
    if (!debouncedSearchTerm) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    
    // In a real app, you would call an API
    // For demo, filter mock data
    setTimeout(() => {
      const filtered = mockMedications.filter(med => 
        med.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        med.genericName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        med.brandNames?.some(brand => brand.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
      );
      
      setResults(filtered);
      setLoading(false);
      setShowResults(true);
    }, 500);
  }, [debouncedSearchTerm]);
  
  const handleInputFocus = () => {
    if (searchTerm) {
      setShowResults(true);
    }
  };
  
  const handleInputBlur = () => {
    // Delay hiding results to allow for clicking on them
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };
  
  const handleSelectMedication = (medication: Medication) => {
    onSelect(medication);
    setSearchTerm('');
    setResults([]);
    setShowResults(false);
  };
  
  const toggleMedicationDetails = (id: string) => {
    setExpandedMedication(expandedMedication === id ? null : id);
  };
  
  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* Results Dropdown */}
      {showResults && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="w-6 h-6 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-600">Searching medications...</p>
            </div>
          ) : results.length > 0 ? (
            <div>
              {results.map(medication => (
                <div key={medication.id} className="border-b border-gray-100 last:border-b-0">
                  <div 
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSelectMedication(medication)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {medication.imageUrl ? (
                          <img 
                            src={medication.imageUrl} 
                            alt={medication.name} 
                            className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Pill className="w-5 h-5 text-purple-600" />
                          </div>
                        )}
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-800">{medication.name}</h4>
                            {medication.controlled && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                                Schedule {medication.schedule}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {medication.strength} {medication.form}
                            {medication.genericName !== medication.name && ` (${medication.genericName})`}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMedicationDetails(medication.id);
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {expandedMedication === medication.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    
                    {/* Expanded Details */}
                    {expandedMedication === medication.id && (
                      <div className="mt-3 pt-3 border-t border-gray-100 animate-fade-in">
                        {/* Common Dosages */}
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Common Dosages</h5>
                          <div className="flex flex-wrap gap-2">
                            {medication.commonDosages.map((dosage, index) => (
                              <button
                                key={index}
                                className="px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-full hover:bg-purple-100 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle dosage selection
                                }}
                              >
                                {dosage}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Price Information */}
                        {medication.price && (
                          <div className="mb-3">
                            <h5 className="text-sm font-medium text-gray-700 mb-1">Pricing</h5>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <DollarSign className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                  Brand: ${medication.price.retail.toFixed(2)}
                                </span>
                              </div>
                              
                              {medication.price.generic && (
                                <div className="flex items-center space-x-1">
                                  <DollarSign className="w-4 h-4 text-green-500" />
                                  <span className="text-sm text-green-600">
                                    Generic: ${medication.price.generic.toFixed(2)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Warnings */}
                        {medication.warnings && medication.warnings.length > 0 && (
                          <div className="mb-3">
                            <div className="flex items-center space-x-1 mb-1">
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                              <h5 className="text-sm font-medium text-amber-700">Warnings</h5>
                            </div>
                            <ul className="space-y-1">
                              {medication.warnings.map((warning, index) => (
                                <li key={index} className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg">
                                  {warning}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Interactions */}
                        {medication.interactions && medication.interactions.length > 0 && (
                          <div>
                            <div className="flex items-center space-x-1 mb-1">
                              <Info className="w-4 h-4 text-blue-500" />
                              <h5 className="text-sm font-medium text-blue-700">Interactions</h5>
                            </div>
                            <p className="text-xs text-blue-700">
                              May interact with: {medication.interactions.join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="text-gray-600">No medications found</p>
              <p className="text-sm text-gray-500 mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};