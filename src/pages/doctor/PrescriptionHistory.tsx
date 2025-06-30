import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Download, 
  Printer, 
  Copy, 
  Pill, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Check, 
  AlertTriangle,
  Eye,
  Edit,
  MoreHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../lib/supabase';
import { format, parseISO, isAfter } from 'date-fns';

interface Prescription {
  id: string;
  patient: {
    id: string;
    name: string;
    email: string;
    profile_photo_url?: string;
  };
  date: string;
  expiry_date: string;
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
  status: 'active' | 'expired' | 'cancelled' | 'completed';
  refills: number;
  refills_used: number;
  notes?: string;
  last_refill_date?: string;
}

export const PrescriptionHistory: React.FC = () => {
  const { user } = useAuth();
  const { success, error, info } = useToast();
  
  // State
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedPrescription, setExpandedPrescription] = useState<string | null>(null);
  const [selectedPrescriptions, setSelectedPrescriptions] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Load prescriptions
  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // In a real app, fetch from Supabase
        // const { data, error } = await supabase
        //   .from('prescriptions')
        //   .select(`
        //     *,
        //     patient:patient_id(id, name, email, profile_photo_url)
        //   `)
        //   .eq('doctor_id', user.id);
        
        // For demo, use mock data
        const mockPrescriptions: Prescription[] = [
          {
            id: '1',
            patient: {
              id: '1',
              name: 'John Smith',
              email: 'john.smith@example.com',
              profile_photo_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
            },
            date: '2025-01-02',
            expiry_date: '2025-02-02',
            medications: [
              {
                name: 'Lisinopril',
                strength: '10mg',
                form: 'Tablet',
                dosage: '1 tablet',
                frequency: 'once daily',
                duration: '30 days',
                instructions: 'Take in the morning with or without food',
                isGeneric: true
              }
            ],
            status: 'active',
            refills: 3,
            refills_used: 0,
            notes: 'Monitor blood pressure weekly'
          },
          {
            id: '2',
            patient: {
              id: '2',
              name: 'Maria Garcia',
              email: 'maria.garcia@example.com',
              profile_photo_url: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
            },
            date: '2025-01-01',
            expiry_date: '2025-02-01',
            medications: [
              {
                name: 'Metformin',
                strength: '500mg',
                form: 'Tablet',
                dosage: '1 tablet',
                frequency: 'twice daily',
                duration: '30 days',
                instructions: 'Take with meals',
                isGeneric: true
              },
              {
                name: 'Glipizide',
                strength: '5mg',
                form: 'Tablet',
                dosage: '1 tablet',
                frequency: 'once daily',
                duration: '30 days',
                instructions: 'Take before breakfast',
                isGeneric: true
              }
            ],
            status: 'active',
            refills: 2,
            refills_used: 1,
            notes: 'Check blood sugar regularly',
            last_refill_date: '2025-01-15'
          },
          {
            id: '3',
            patient: {
              id: '3',
              name: 'David Wilson',
              email: 'david.wilson@example.com'
            },
            date: '2024-12-15',
            expiry_date: '2025-01-15',
            medications: [
              {
                name: 'Atorvastatin',
                strength: '20mg',
                form: 'Tablet',
                dosage: '1 tablet',
                frequency: 'once daily',
                duration: '30 days',
                instructions: 'Take in the evening',
                isGeneric: true
              }
            ],
            status: 'expired',
            refills: 0,
            refills_used: 0
          },
          {
            id: '4',
            patient: {
              id: '1',
              name: 'John Smith',
              email: 'john.smith@example.com',
              profile_photo_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
            },
            date: '2024-12-01',
            expiry_date: '2025-01-01',
            medications: [
              {
                name: 'Amoxicillin',
                strength: '500mg',
                form: 'Capsule',
                dosage: '1 capsule',
                frequency: 'three times daily',
                duration: '10 days',
                instructions: 'Take until all medication is finished',
                isGeneric: true
              }
            ],
            status: 'completed',
            refills: 0,
            refills_used: 0
          }
        ];
        
        setPrescriptions(mockPrescriptions);
        setFilteredPrescriptions(mockPrescriptions);
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
        error('Failed to load prescriptions');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrescriptions();
  }, [user, error]);
  
  // Apply filters and sorting
  useEffect(() => {
    if (prescriptions.length === 0) return;
    
    let filtered = [...prescriptions];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(prescription => 
        prescription.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.medications.some(med => 
          med.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(prescription => prescription.status === statusFilter);
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(today.getDate() - 90);
      
      filtered = filtered.filter(prescription => {
        const prescriptionDate = parseISO(prescription.date);
        
        switch (dateFilter) {
          case 'last30days':
            return isAfter(prescriptionDate, thirtyDaysAgo);
          case 'last90days':
            return isAfter(prescriptionDate, ninetyDaysAgo);
          default:
            return true;
        }
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'patient':
          comparison = a.patient.name.localeCompare(b.patient.name);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'refills':
          comparison = a.refills - b.refills;
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredPrescriptions(filtered);
  }, [prescriptions, searchTerm, statusFilter, dateFilter, sortBy, sortOrder]);
  
  // Handle bulk selection
  useEffect(() => {
    setShowBulkActions(selectedPrescriptions.size > 0);
  }, [selectedPrescriptions]);
  
  // Pagination
  const totalPages = Math.ceil(filteredPrescriptions.length / itemsPerPage);
  const paginatedPrescriptions = filteredPrescriptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };
  
  const togglePrescriptionExpand = (id: string) => {
    setExpandedPrescription(expandedPrescription === id ? null : id);
  };
  
  const togglePrescriptionSelection = (id: string) => {
    setSelectedPrescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  
  const handleSelectAll = () => {
    if (selectedPrescriptions.size === paginatedPrescriptions.length) {
      setSelectedPrescriptions(new Set());
    } else {
      setSelectedPrescriptions(new Set(paginatedPrescriptions.map(p => p.id)));
    }
  };
  
  const handleBulkRenew = () => {
    info(`Renewing ${selectedPrescriptions.size} prescriptions...`);
    // In a real app, you would call an API to renew the prescriptions
    setTimeout(() => {
      success(`${selectedPrescriptions.size} prescriptions renewed successfully`);
      setSelectedPrescriptions(new Set());
    }, 1500);
  };
  
  const handleBulkPrint = () => {
    info(`Preparing ${selectedPrescriptions.size} prescriptions for printing...`);
    // In a real app, you would generate PDFs and print them
    setTimeout(() => {
      success(`${selectedPrescriptions.size} prescriptions sent to printer`);
      setSelectedPrescriptions(new Set());
    }, 1500);
  };
  
  const handleBulkExport = () => {
    info(`Exporting ${selectedPrescriptions.size} prescriptions...`);
    // In a real app, you would generate a CSV or PDF export
    setTimeout(() => {
      success(`${selectedPrescriptions.size} prescriptions exported successfully`);
      setSelectedPrescriptions(new Set());
    }, 1500);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Prescription History</h1>
            <p className="text-gray-600 mt-2">Manage and track patient prescriptions</p>
          </div>
          
          <Button
            variant="primary"
            onClick={() => window.location.href = '/doctor/prescriptions/new'}
          >
            Create Prescription
          </Button>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Prescriptions</p>
                <p className="text-2xl font-bold text-gray-800">
                  {prescriptions.filter(p => p.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Expiring Soon</p>
                <p className="text-2xl font-bold text-gray-800">2</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Refills Pending</p>
                <p className="text-2xl font-bold text-gray-800">3</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Patients</p>
                <p className="text-2xl font-bold text-gray-800">
                  {new Set(prescriptions.map(p => p.patient.id)).size}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by patient name or medication..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>
            
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="all">All Time</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last90days">Last 90 Days</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="bg-purple-100 rounded-xl p-4 border border-purple-200 mb-6 animate-slide-down">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-800">
                  {selectedPrescriptions.size} prescription{selectedPrescriptions.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  icon={RefreshCw}
                  onClick={handleBulkRenew}
                >
                  Renew
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  icon={Printer}
                  onClick={handleBulkPrint}
                >
                  Print
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  icon={Download}
                  onClick={handleBulkExport}
                >
                  Export
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  icon={X}
                  onClick={() => setSelectedPrescriptions(new Set())}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Prescriptions Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedPrescriptions.size === paginatedPrescriptions.length && paginatedPrescriptions.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <div 
                      className="flex items-center space-x-1 cursor-pointer"
                      onClick={() => handleSort('patient')}
                    >
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</span>
                      {sortBy === 'patient' && (
                        sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <div 
                      className="flex items-center space-x-1 cursor-pointer"
                      onClick={() => handleSort('date')}
                    >
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date</span>
                      {sortBy === 'date' && (
                        sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Medications</span>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <div 
                      className="flex items-center space-x-1 cursor-pointer"
                      onClick={() => handleSort('refills')}
                    >
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Refills</span>
                      {sortBy === 'refills' && (
                        sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <div 
                      className="flex items-center space-x-1 cursor-pointer"
                      onClick={() => handleSort('status')}
                    >
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</span>
                      {sortBy === 'status' && (
                        sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedPrescriptions.map((prescription) => (
                  <React.Fragment key={prescription.id}>
                    <tr className={`hover:bg-gray-50 transition-colors ${
                      selectedPrescriptions.has(prescription.id) ? 'bg-purple-50' : ''
                    }`}>
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedPrescriptions.has(prescription.id)}
                          onChange={() => togglePrescriptionSelection(prescription.id)}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {prescription.patient.profile_photo_url ? (
                              <img
                                src={prescription.patient.profile_photo_url}
                                alt={prescription.patient.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-purple-600" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{prescription.patient.name}</p>
                            <p className="text-sm text-gray-500">{prescription.patient.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-800">
                            {format(parseISO(prescription.date), 'MMM d, yyyy')}
                          </span>
                          <span className="text-xs text-gray-500">
                            Expires: {format(parseISO(prescription.expiry_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-800">
                            {prescription.medications[0].name} {prescription.medications[0].strength}
                          </span>
                          {prescription.medications.length > 1 && (
                            <span className="text-xs text-gray-500">
                              +{prescription.medications.length - 1} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-medium text-gray-800">
                            {prescription.refills_used}/{prescription.refills}
                          </span>
                          {prescription.refills > 0 && prescription.refills_used < prescription.refills && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(prescription.status)}`}>
                          {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => togglePrescriptionExpand(prescription.id)}
                            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                          >
                            {expandedPrescription === prescription.id ? (
                              <ChevronUp className="w-5 h-5 text-gray-600" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-600" />
                            )}
                          </button>
                          
                          <div className="relative">
                            <button
                              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                            >
                              <MoreHorizontal className="w-5 h-5 text-gray-600" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Row */}
                    {expandedPrescription === prescription.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {/* Medications */}
                              <div className="md:col-span-2">
                                <h4 className="font-medium text-gray-800 mb-3">Medications</h4>
                                <div className="space-y-3">
                                  {prescription.medications.map((medication, index) => (
                                    <div key={index} className="p-3 bg-white rounded-lg border border-gray-200">
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <p className="font-medium text-gray-800">
                                            {medication.name} {medication.strength} {medication.form}
                                            {!medication.isGeneric && ' (Dispense as written)'}
                                          </p>
                                          
                                          <div className="mt-1 text-sm text-gray-600">
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
                                        
                                        {medication.isGeneric && (
                                          <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                            Generic
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Details */}
                              <div>
                                <h4 className="font-medium text-gray-800 mb-3">Prescription Details</h4>
                                <div className="p-3 bg-white rounded-lg border border-gray-200">
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600">Prescription Date:</span>
                                      <span className="text-sm font-medium text-gray-800">
                                        {format(parseISO(prescription.date), 'MMM d, yyyy')}
                                      </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600">Expiry Date:</span>
                                      <span className="text-sm font-medium text-gray-800">
                                        {format(parseISO(prescription.expiry_date), 'MMM d, yyyy')}
                                      </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600">Refills:</span>
                                      <span className="text-sm font-medium text-gray-800">
                                        {prescription.refills_used} of {prescription.refills} used
                                      </span>
                                    </div>
                                    
                                    {prescription.last_refill_date && (
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Last Refill:</span>
                                        <span className="text-sm font-medium text-gray-800">
                                          {format(parseISO(prescription.last_refill_date), 'MMM d, yyyy')}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {prescription.notes && (
                                      <div className="pt-2 mt-2 border-t border-gray-200">
                                        <span className="text-sm text-gray-600">Notes:</span>
                                        <p className="text-sm text-gray-800 mt-1">{prescription.notes}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex space-x-2 mt-3">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    icon={Eye}
                                    fullWidth
                                  >
                                    View
                                  </Button>
                                  
                                  {prescription.status === 'active' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      icon={RefreshCw}
                                      fullWidth
                                    >
                                      Renew
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                
                {paginatedPrescriptions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <FileText className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-gray-500 mb-2">No prescriptions found</p>
                        <p className="text-sm text-gray-400">
                          {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                            ? 'Try adjusting your filters' 
                            : 'Create your first prescription'
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPrescriptions.length)} of {filteredPrescriptions.length} prescriptions
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        currentPage === pageNumber
                          ? 'bg-purple-600 text-white'
                          : 'border border-gray-200 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                {totalPages > 5 && (
                  <span className="text-gray-500">...</span>
                )}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};