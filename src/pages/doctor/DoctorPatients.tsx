import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Plus, 
  MessageCircle, 
  Eye, 
  Calendar, 
  AlertTriangle,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Download,
  Send,
  MoreHorizontal,
  Heart,
  Activity,
  TrendingUp,
  FileText,
  Settings,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../hooks/useToast';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profile_photo_url?: string;
  age: number;
  condition: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'needs_attention' | 'scheduled' | 'completed';
  last_visit: string;
  next_appointment?: string;
  progress: number;
  unread_messages: number;
  is_online: boolean;
  created_at: string;
  medical_history?: string;
  current_medications?: string[];
  allergies?: string[];
}

interface FilterState {
  search: string;
  status: string;
  priority: string;
  condition: string;
  ageRange: [number, number];
  lastVisitDays: number;
}

export const DoctorPatients: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  
  // State management
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPatients, setSelectedPatients] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<keyof Patient>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    priority: 'all',
    condition: 'all',
    ageRange: [0, 100],
    lastVisitDays: 365
  });

  // Mock data for demonstration
  const mockPatients: Patient[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      profile_photo_url: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      age: 34,
      condition: 'Hypertension',
      priority: 'medium',
      status: 'active',
      last_visit: '2024-12-28',
      next_appointment: '2025-01-15',
      progress: 75,
      unread_messages: 2,
      is_online: true,
      created_at: '2024-01-15',
      medical_history: 'Family history of heart disease',
      current_medications: ['Lisinopril 10mg', 'Metformin 500mg'],
      allergies: ['Penicillin']
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '+1 (555) 987-6543',
      profile_photo_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      age: 45,
      condition: 'Diabetes Type 2',
      priority: 'high',
      status: 'needs_attention',
      last_visit: '2024-12-20',
      next_appointment: '2025-01-08',
      progress: 60,
      unread_messages: 0,
      is_online: false,
      created_at: '2024-02-20',
      medical_history: 'Diagnosed with diabetes 5 years ago',
      current_medications: ['Metformin 1000mg', 'Insulin'],
      allergies: ['Sulfa drugs']
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@email.com',
      phone: '+1 (555) 456-7890',
      profile_photo_url: 'https://images.pexels.com/photos/559827/pexels-photo-559827.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      age: 28,
      condition: 'Anxiety Disorder',
      priority: 'low',
      status: 'scheduled',
      last_visit: '2024-12-25',
      next_appointment: '2025-01-12',
      progress: 90,
      unread_messages: 1,
      is_online: true,
      created_at: '2024-03-10',
      medical_history: 'No significant medical history',
      current_medications: ['Sertraline 50mg'],
      allergies: ['None known']
    },
    {
      id: '4',
      name: 'David Wilson',
      email: 'david.wilson@email.com',
      phone: '+1 (555) 321-0987',
      age: 67,
      condition: 'Chronic Pain',
      priority: 'critical',
      status: 'needs_attention',
      last_visit: '2024-12-30',
      progress: 40,
      unread_messages: 5,
      is_online: false,
      created_at: '2024-01-05',
      medical_history: 'Previous back surgery, chronic pain management',
      current_medications: ['Gabapentin 300mg', 'Ibuprofen 600mg'],
      allergies: ['Codeine', 'Morphine']
    }
  ];

  // Load patients data
  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);
      try {
        // In a real app, this would fetch from Supabase
        // const { data, error } = await supabase
        //   .from('patient_profiles')
        //   .select(`
        //     *,
        //     users!inner(*)
        //   `)
        //   .eq('doctor_id', user?.id);
        
        // For now, use mock data
        setTimeout(() => {
          setPatients(mockPatients);
          setLoading(false);
        }, 1000);
      } catch (err) {
        error('Failed to load patients');
        setLoading(false);
      }
    };

    if (user) {
      loadPatients();
    }
  }, [user, error]);

  // Filter and sort patients
  const filteredAndSortedPatients = useMemo(() => {
    let filtered = patients.filter(patient => {
      const matchesSearch = patient.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                           patient.email.toLowerCase().includes(filters.search.toLowerCase()) ||
                           patient.condition.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || patient.status === filters.status;
      const matchesPriority = filters.priority === 'all' || patient.priority === filters.priority;
      const matchesAge = patient.age >= filters.ageRange[0] && patient.age <= filters.ageRange[1];
      
      const daysSinceLastVisit = Math.floor(
        (new Date().getTime() - new Date(patient.last_visit).getTime()) / (1000 * 60 * 60 * 24)
      );
      const matchesLastVisit = daysSinceLastVisit <= filters.lastVisitDays;

      return matchesSearch && matchesStatus && matchesPriority && matchesAge && matchesLastVisit;
    });

    // Sort patients
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [patients, filters, sortField, sortDirection]);

  // Handle patient selection
  const handlePatientSelect = useCallback((patientId: string) => {
    setSelectedPatients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(patientId)) {
        newSet.delete(patientId);
      } else {
        newSet.add(patientId);
      }
      setShowBulkActions(newSet.size > 0);
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedPatients.size === filteredAndSortedPatients.length) {
      setSelectedPatients(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedPatients(new Set(filteredAndSortedPatients.map(p => p.id)));
      setShowBulkActions(true);
    }
  }, [selectedPatients.size, filteredAndSortedPatients]);

  // Handle sorting
  const handleSort = useCallback((field: keyof Patient) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'needs_attention': return 'bg-red-100 text-red-800 border-red-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Calculate time until next appointment
  const getTimeUntilAppointment = (appointmentDate?: string) => {
    if (!appointmentDate) return null;
    
    const now = new Date();
    const appointment = new Date(appointmentDate);
    const diff = appointment.getTime() - now.getTime();
    
    if (diff < 0) return 'Overdue';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-purple-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <LoadingSkeleton variant="text" width="300px" height="40px" className="mb-4" />
            <LoadingSkeleton variant="text" width="500px" height="20px" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <LoadingSkeleton variant="circular" width={80} height={80} className="mx-auto mb-4" />
                <LoadingSkeleton variant="text" width="150px" className="mx-auto mb-2" />
                <LoadingSkeleton variant="text" width="100px" className="mx-auto mb-4" />
                <LoadingSkeleton variant="rectangular" height="60px" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-purple-800 font-['Inter',sans-serif]">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
                My Patients
                <span className="ml-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-lg font-medium animate-pulse">
                  {filteredAndSortedPatients.length}
                </span>
              </h1>
              <p className="text-white/80 text-lg">Manage your patient care and communications</p>
            </div>
            
            <button className="bg-gradient-to-r from-teal-400 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-teal-500 hover:to-blue-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2 animate-pulse">
              <Plus className="w-5 h-5" />
              <span className="font-medium">Add Patient</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60 transition-all duration-300 ${
                  filters.search ? 'text-white scale-110' : ''
                }`} />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Search patients, conditions, or emails..."
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-300 backdrop-blur-sm"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center space-x-3">
                {['all', 'active', 'needs_attention', 'scheduled', 'critical'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilters(prev => ({ ...prev, status }))}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      filters.status === status
                        ? 'bg-white text-purple-600 shadow-lg scale-105'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    showFilters ? 'bg-white text-purple-600' : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <Filter className="w-5 h-5" />
                </button>

                <div className="flex bg-white/20 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all duration-300 ${
                      viewMode === 'grid' ? 'bg-white text-purple-600' : 'text-white hover:bg-white/20'
                    }`}
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all duration-300 ${
                      viewMode === 'list' ? 'bg-white text-purple-600' : 'text-white hover:bg-white/20'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Filters Sidebar */}
          {showFilters && (
            <div className="mt-4 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl animate-slide-down">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Priority Level</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <option value="all">All Priorities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Age Range</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={filters.ageRange[0]}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        ageRange: [parseInt(e.target.value) || 0, prev.ageRange[1]] 
                      }))}
                      className="w-20 px-2 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                      placeholder="Min"
                    />
                    <span className="text-white/60">-</span>
                    <input
                      type="number"
                      value={filters.ageRange[1]}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        ageRange: [prev.ageRange[0], parseInt(e.target.value) || 100] 
                      }))}
                      className="w-20 px-2 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                      placeholder="Max"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Last Visit</label>
                  <select
                    value={filters.lastVisitDays}
                    onChange={(e) => setFilters(prev => ({ ...prev, lastVisitDays: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 3 months</option>
                    <option value={365}>Last year</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => setFilters({
                      search: '',
                      status: 'all',
                      priority: 'all',
                      condition: 'all',
                      ageRange: [0, 100],
                      lastVisitDays: 365
                    })}
                    className="w-full bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Clear Filters</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions Bar */}
        {showBulkActions && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-2xl z-50 animate-slide-up">
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">
                {selectedPatients.size} patient{selectedPatients.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>Message</span>
                </button>
                <button className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Schedule</span>
                </button>
                <button className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedPatients(new Set());
                    setShowBulkActions(false);
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Patient Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedPatients.map((patient, index) => (
              <div
                key={patient.id}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Selection Checkbox */}
                <div className="flex items-center justify-between mb-4">
                  <input
                    type="checkbox"
                    checked={selectedPatients.has(patient.id)}
                    onChange={() => handlePatientSelect(patient.id)}
                    className="w-4 h-4 text-blue-600 bg-white/20 border-white/30 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(patient.priority)} ${
                      patient.priority === 'critical' ? 'animate-pulse' : ''
                    }`} />
                    {patient.unread_messages > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
                        {patient.unread_messages}
                      </span>
                    )}
                  </div>
                </div>

                {/* Patient Photo and Status */}
                <div className="relative mb-4">
                  <div className="w-20 h-20 mx-auto relative">
                    {patient.profile_photo_url ? (
                      <img
                        src={patient.profile_photo_url}
                        alt={patient.name}
                        className="w-full h-full rounded-full object-cover ring-4 ring-white/30 group-hover:ring-white/50 transition-all duration-300"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center ring-4 ring-white/30 group-hover:ring-white/50 transition-all duration-300">
                        <User className="w-8 h-8 text-white" />
                      </div>
                    )}
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${
                      patient.is_online ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                </div>

                {/* Patient Info */}
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-200 transition-colors">
                    {patient.name}
                  </h3>
                  <p className="text-white/70 text-sm mb-2">Age {patient.age} • {patient.condition}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(patient.status)}`}>
                    {patient.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-white/70 mb-1">
                    <span>Treatment Progress</span>
                    <span>{patient.progress}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-teal-400 to-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${patient.progress}%` }}
                    />
                  </div>
                </div>

                {/* Appointment Info */}
                {patient.next_appointment && (
                  <div className="mb-4 p-3 bg-white/10 rounded-lg border border-white/20">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Next Appointment</span>
                      <span className="text-white font-medium">
                        {getTimeUntilAppointment(patient.next_appointment)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button className="flex-1 bg-blue-500/80 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button className="flex-1 bg-teal-500/80 text-white p-2 rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="flex-1 bg-purple-500/80 text-white p-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </button>
                  {patient.priority === 'critical' && (
                    <button className="flex-1 bg-red-500/80 text-white p-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center animate-pulse">
                      <AlertTriangle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Patient List View */}
        {viewMode === 'list' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl overflow-hidden">
            {/* Table Header */}
            <div className="bg-white/20 border-b border-white/20 p-4">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={selectedPatients.size === filteredAndSortedPatients.length && filteredAndSortedPatients.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 bg-white/20 border-white/30 rounded focus:ring-blue-500 focus:ring-2"
                />
                <div className="grid grid-cols-12 gap-4 flex-1 text-white/80 text-sm font-medium">
                  <div className="col-span-3 flex items-center space-x-2 cursor-pointer" onClick={() => handleSort('name')}>
                    <span>Patient</span>
                    {sortField === 'name' && (
                      sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                    )}
                  </div>
                  <div className="col-span-2 flex items-center space-x-2 cursor-pointer" onClick={() => handleSort('condition')}>
                    <span>Condition</span>
                    {sortField === 'condition' && (
                      sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                    )}
                  </div>
                  <div className="col-span-1 flex items-center space-x-2 cursor-pointer" onClick={() => handleSort('priority')}>
                    <span>Priority</span>
                    {sortField === 'priority' && (
                      sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                    )}
                  </div>
                  <div className="col-span-2 flex items-center space-x-2 cursor-pointer" onClick={() => handleSort('status')}>
                    <span>Status</span>
                    {sortField === 'status' && (
                      sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                    )}
                  </div>
                  <div className="col-span-2 flex items-center space-x-2 cursor-pointer" onClick={() => handleSort('last_visit')}>
                    <span>Last Visit</span>
                    {sortField === 'last_visit' && (
                      sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                    )}
                  </div>
                  <div className="col-span-1">Progress</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-white/10">
              {filteredAndSortedPatients.map((patient, index) => (
                <div key={patient.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="p-4 hover:bg-white/5 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedPatients.has(patient.id)}
                        onChange={() => handlePatientSelect(patient.id)}
                        className="w-4 h-4 text-blue-600 bg-white/20 border-white/30 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      
                      <div className="grid grid-cols-12 gap-4 flex-1">
                        {/* Patient Info */}
                        <div className="col-span-3 flex items-center space-x-3">
                          <div className="relative">
                            {patient.profile_photo_url ? (
                              <img
                                src={patient.profile_photo_url}
                                alt={patient.name}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-white/30"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center ring-2 ring-white/30">
                                <User className="w-5 h-5 text-white" />
                              </div>
                            )}
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white ${
                              patient.is_online ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                          </div>
                          <div>
                            <p className="text-white font-medium">{patient.name}</p>
                            <p className="text-white/60 text-sm">Age {patient.age}</p>
                          </div>
                        </div>

                        {/* Condition */}
                        <div className="col-span-2 flex items-center">
                          <span className="text-white/80">{patient.condition}</span>
                        </div>

                        {/* Priority */}
                        <div className="col-span-1 flex items-center">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${getPriorityColor(patient.priority)} ${
                              patient.priority === 'critical' ? 'animate-pulse' : ''
                            }`} />
                            <span className="text-white/80 capitalize">{patient.priority}</span>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="col-span-2 flex items-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(patient.status)}`}>
                            {patient.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>

                        {/* Last Visit */}
                        <div className="col-span-2 flex items-center">
                          <span className="text-white/80">{new Date(patient.last_visit).toLocaleDateString()}</span>
                        </div>

                        {/* Progress */}
                        <div className="col-span-1 flex items-center">
                          <div className="w-full">
                            <div className="w-full bg-white/20 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-teal-400 to-blue-500 h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${patient.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-white/60 mt-1">{patient.progress}%</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="col-span-1 flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setExpandedRows(prev => {
                              const newSet = new Set(prev);
                              if (newSet.has(patient.id)) {
                                newSet.delete(patient.id);
                              } else {
                                newSet.add(patient.id);
                              }
                              return newSet;
                            })}
                            className="text-white/60 hover:text-white transition-colors"
                          >
                            {expandedRows.has(patient.id) ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                          <button className="text-white/60 hover:text-white transition-colors">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Row Details */}
                  {expandedRows.has(patient.id) && (
                    <div className="px-4 pb-4 bg-white/5 animate-slide-down">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-white/10 rounded-lg border border-white/20">
                        <div>
                          <h4 className="text-white font-medium mb-2">Contact Information</h4>
                          <div className="space-y-2 text-sm text-white/70">
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4" />
                              <span>{patient.email}</span>
                            </div>
                            {patient.phone && (
                              <div className="flex items-center space-x-2">
                                <Phone className="w-4 h-4" />
                                <span>{patient.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-white font-medium mb-2">Medical Information</h4>
                          <div className="space-y-2 text-sm text-white/70">
                            <p><strong>History:</strong> {patient.medical_history}</p>
                            <p><strong>Medications:</strong> {patient.current_medications?.join(', ')}</p>
                            <p><strong>Allergies:</strong> {patient.allergies?.join(', ')}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-white font-medium mb-2">Quick Actions</h4>
                          <div className="flex flex-wrap gap-2">
                            <button className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center space-x-1">
                              <MessageCircle className="w-4 h-4" />
                              <span>Message</span>
                            </button>
                            <button className="bg-teal-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-teal-600 transition-colors flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Schedule</span>
                            </button>
                            <button className="bg-purple-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-purple-600 transition-colors flex items-center space-x-1">
                              <FileText className="w-4 h-4" />
                              <span>Records</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredAndSortedPatients.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 shadow-xl max-w-md mx-auto">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-12 h-12 text-white/60" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">No patients found</h3>
              <p className="text-white/70 mb-6">
                {filters.search || filters.status !== 'all' 
                  ? "Try adjusting your search or filter criteria"
                  : "Start building your patient list by adding your first patient"
                }
              </p>
              <button className="bg-gradient-to-r from-teal-400 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-teal-500 hover:to-blue-600 transition-all duration-300 hover:scale-105 shadow-lg">
                Add Your First Patient
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};