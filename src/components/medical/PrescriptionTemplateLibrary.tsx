import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Star, X, ChevronDown, ChevronUp, Pill, Clock, User } from 'lucide-react';
import { PrescriptionTemplate } from './PrescriptionTemplate';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

interface Template {
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
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface PrescriptionTemplateLibraryProps {
  onSelectTemplate: (template: Template) => void;
  onCreateTemplate?: () => void;
  className?: string;
}

export const PrescriptionTemplateLibrary: React.FC<PrescriptionTemplateLibraryProps> = ({
  onSelectTemplate,
  onCreateTemplate,
  className = ''
}) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'recent'>('usage');
  const [expandedFilters, setExpandedFilters] = useState(false);
  
  // Mock categories
  const categories = [
    { id: 'all', name: 'All Categories', count: 0 },
    { id: 'cardiology', name: 'Cardiology', count: 0 },
    { id: 'endocrinology', name: 'Endocrinology', count: 0 },
    { id: 'general', name: 'General Practice', count: 0 },
    { id: 'neurology', name: 'Neurology', count: 0 },
    { id: 'custom', name: 'My Templates', count: 0 }
  ];
  
  // Mock templates
  const mockTemplates: Template[] = [
    {
      id: '1',
      name: 'Hypertension Standard',
      description: 'Standard treatment for hypertension',
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
        },
        {
          name: 'Hydrochlorothiazide',
          strength: '12.5mg',
          form: 'Tablet',
          dosage: '1 tablet',
          frequency: 'once daily',
          duration: '30 days',
          instructions: 'Take in the morning with food',
          isGeneric: true
        }
      ],
      category: 'Cardiology',
      isStarred: true,
      usageCount: 42,
      lastUsed: '2025-01-01',
      createdBy: 'System',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'Diabetes Type 2',
      description: 'First-line treatment for Type 2 Diabetes',
      medications: [
        {
          name: 'Metformin',
          strength: '500mg',
          form: 'Tablet',
          dosage: '1 tablet',
          frequency: 'twice daily',
          duration: '30 days',
          instructions: 'Take with meals to reduce GI side effects',
          isGeneric: true
        }
      ],
      category: 'Endocrinology',
      isStarred: false,
      usageCount: 28,
      lastUsed: '2024-12-15',
      createdBy: 'System',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '3',
      name: 'Cholesterol Management',
      description: 'Standard statin therapy',
      medications: [
        {
          name: 'Atorvastatin',
          strength: '20mg',
          form: 'Tablet',
          dosage: '1 tablet',
          frequency: 'once daily',
          duration: '90 days',
          instructions: 'Take in the evening',
          isGeneric: true
        }
      ],
      category: 'Cardiology',
      isStarred: true,
      usageCount: 35,
      lastUsed: '2024-12-20',
      createdBy: 'System',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '4',
      name: 'Anxiety Management',
      description: 'First-line treatment for anxiety disorders',
      medications: [
        {
          name: 'Sertraline',
          strength: '50mg',
          form: 'Tablet',
          dosage: '1 tablet',
          frequency: 'once daily',
          duration: '30 days',
          instructions: 'Take in the morning with food',
          isGeneric: true
        }
      ],
      category: 'Neurology',
      isStarred: false,
      usageCount: 22,
      createdBy: 'System',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '5',
      name: 'Common Cold',
      description: 'Symptomatic treatment for common cold',
      medications: [
        {
          name: 'Acetaminophen',
          strength: '500mg',
          form: 'Tablet',
          dosage: '1-2 tablets',
          frequency: 'every 6 hours as needed',
          duration: '7 days',
          instructions: 'Do not exceed 4000mg in 24 hours',
          isGeneric: true
        },
        {
          name: 'Pseudoephedrine',
          strength: '30mg',
          form: 'Tablet',
          dosage: '1 tablet',
          frequency: 'every 6 hours as needed',
          duration: '7 days',
          instructions: 'May cause insomnia if taken near bedtime',
          isGeneric: true
        }
      ],
      category: 'General Practice',
      isStarred: false,
      usageCount: 18,
      lastUsed: '2024-12-10',
      createdBy: 'System',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ];
  
  // Load templates on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        // In a real app, fetch from Supabase
        // const { data, error } = await supabase
        //   .from('prescription_templates')
        //   .select('*');
        
        // For demo, use mock data
        setTimeout(() => {
          setTemplates(mockTemplates);
          setFilteredTemplates(mockTemplates);
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error('Error fetching templates:', err);
        error('Failed to load templates');
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, [error]);
  
  // Update category counts
  useEffect(() => {
    const categoryCounts = templates.reduce((acc, template) => {
      const category = template.category.toLowerCase();
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Update the categories array with counts
    categories.forEach(category => {
      if (category.id === 'all') {
        category.count = templates.length;
      } else if (category.id === 'custom') {
        category.count = templates.filter(t => t.createdBy === user?.id).length;
      } else {
        category.count = categoryCounts[category.id] || 0;
      }
    });
  }, [templates, user]);
  
  // Apply filters
  useEffect(() => {
    let filtered = [...templates];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.medications.some(med => 
          med.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      if (categoryFilter === 'custom') {
        filtered = filtered.filter(template => template.createdBy === user?.id);
      } else {
        filtered = filtered.filter(template => 
          template.category.toLowerCase() === categoryFilter
        );
      }
    }
    
    // Apply starred filter
    if (showStarredOnly) {
      filtered = filtered.filter(template => template.isStarred);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'usage':
          return b.usageCount - a.usageCount;
        case 'recent':
          const aDate = a.lastUsed ? new Date(a.lastUsed).getTime() : 0;
          const bDate = b.lastUsed ? new Date(b.lastUsed).getTime() : 0;
          return bDate - aDate;
        default:
          return 0;
      }
    });
    
    setFilteredTemplates(filtered);
  }, [templates, searchTerm, categoryFilter, showStarredOnly, sortBy, user]);
  
  const handleToggleStar = async (id: string) => {
    try {
      // In a real app, update in Supabase
      // const { error: updateError } = await supabase
      //   .from('prescription_templates')
      //   .update({ is_starred: !templates.find(t => t.id === id)?.isStarred })
      //   .eq('id', id);
      
      // For demo, update local state
      setTemplates(prev => 
        prev.map(template => 
          template.id === id 
            ? { ...template, isStarred: !template.isStarred } 
            : template
        )
      );
      
      success('Template updated');
    } catch (err) {
      console.error('Error updating template:', err);
      error('Failed to update template');
    }
  };
  
  const handleDeleteTemplate = async (id: string) => {
    try {
      // In a real app, delete from Supabase
      // const { error: deleteError } = await supabase
      //   .from('prescription_templates')
      //   .delete()
      //   .eq('id', id);
      
      // For demo, update local state
      setTemplates(prev => prev.filter(template => template.id !== id));
      
      success('Template deleted');
    } catch (err) {
      console.error('Error deleting template:', err);
      error('Failed to delete template');
    }
  };
  
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Prescription Templates</h2>
          
          {onCreateTemplate && (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={onCreateTemplate}
            >
              Create Template
            </Button>
          )}
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
      </div>
      
      {/* Filters */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            
            <button
              onClick={() => setCategoryFilter('cardiology')}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                categoryFilter === 'cardiology'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Cardiology
            </button>
            
            <button
              onClick={() => setCategoryFilter('endocrinology')}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                categoryFilter === 'endocrinology'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Endocrinology
            </button>
            
            <button
              onClick={() => setCategoryFilter('custom')}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                categoryFilter === 'custom'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              My Templates
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowStarredOnly(!showStarredOnly)}
              className={`p-2 rounded-lg transition-colors ${
                showStarredOnly
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Star className={`w-5 h-5 ${showStarredOnly ? 'fill-current' : ''}`} />
            </button>
            
            <button
              onClick={() => setExpandedFilters(!expandedFilters)}
              className="p-2 rounded-lg bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Expanded Filters */}
        {expandedFilters && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 animate-slide-down">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-800">Advanced Filters</h3>
              <button
                onClick={() => setExpandedFilters(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.count})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="usage">Most Used</option>
                  <option value="recent">Recently Used</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showStarredOnly}
                    onChange={() => setShowStarredOnly(!showStarredOnly)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Show starred templates only</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Templates Grid */}
      <div className="p-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((_, index) => (
              <div key={index} className="bg-gray-100 animate-pulse h-64 rounded-xl"></div>
            ))}
          </div>
        ) : filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <PrescriptionTemplate
                key={template.id}
                id={template.id}
                name={template.name}
                description={template.description}
                medications={template.medications}
                category={template.category}
                isStarred={template.isStarred}
                usageCount={template.usageCount}
                lastUsed={template.lastUsed}
                onApply={() => onSelectTemplate(template)}
                onEdit={() => {/* Handle edit */}}
                onDuplicate={() => {/* Handle duplicate */}}
                onDelete={() => handleDeleteTemplate(template.id)}
                onToggleStar={() => handleToggleStar(template.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Pill className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || categoryFilter !== 'all' || showStarredOnly
                ? 'Try adjusting your search or filters'
                : 'Create your first prescription template'
              }
            </p>
            
            {onCreateTemplate && (
              <Button
                variant="primary"
                icon={Plus}
                onClick={onCreateTemplate}
              >
                Create Template
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};