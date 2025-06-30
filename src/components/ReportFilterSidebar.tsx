import React, { useState } from 'react';
import { Calendar, Filter, X, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Button } from './ui/Button';

interface ReportFilterSidebarProps {
  onFilter: (filters: ReportFilters) => void;
  onClearFilters: () => void;
  className?: string;
}

export interface ReportFilters {
  categories: string[];
  dateRange: {
    from: string | null;
    to: string | null;
  };
  status: string[];
  shared: boolean | null;
  starred: boolean | null;
}

export const ReportFilterSidebar: React.FC<ReportFilterSidebarProps> = ({
  onFilter,
  onClearFilters,
  className = ''
}) => {
  const [filters, setFilters] = useState<ReportFilters>({
    categories: [],
    dateRange: {
      from: null,
      to: null
    },
    status: [],
    shared: null,
    starred: null
  });
  
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    dateRange: true,
    status: true,
    other: true
  });
  
  const categories = [
    { id: 'lab_results', label: 'Lab Results', count: 12 },
    { id: 'imaging', label: 'Imaging', count: 8 },
    { id: 'consultation', label: 'Consultation Notes', count: 15 },
    { id: 'prescriptions', label: 'Prescriptions', count: 7 },
    { id: 'medical_history', label: 'Medical History', count: 3 },
    { id: 'vaccination', label: 'Vaccination Records', count: 2 }
  ];
  
  const statuses = [
    { id: 'normal', label: 'Normal', count: 18 },
    { id: 'abnormal', label: 'Abnormal', count: 5 },
    { id: 'follow_up', label: 'Follow-up Required', count: 7 },
    { id: 'critical', label: 'Critical', count: 2 }
  ];
  
  const toggleCategory = (categoryId: string) => {
    setFilters(prev => {
      const newCategories = prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId];
      
      return {
        ...prev,
        categories: newCategories
      };
    });
  };
  
  const toggleStatus = (statusId: string) => {
    setFilters(prev => {
      const newStatuses = prev.status.includes(statusId)
        ? prev.status.filter(id => id !== statusId)
        : [...prev.status, statusId];
      
      return {
        ...prev,
        status: newStatuses
      };
    });
  };
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const handleDateChange = (field: 'from' | 'to', value: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value || null
      }
    }));
  };
  
  const toggleShared = () => {
    setFilters(prev => ({
      ...prev,
      shared: prev.shared === null ? true : prev.shared === true ? false : null
    }));
  };
  
  const toggleStarred = () => {
    setFilters(prev => ({
      ...prev,
      starred: prev.starred === null ? true : prev.starred === true ? false : null
    }));
  };
  
  const applyFilters = () => {
    onFilter(filters);
  };
  
  const clearFilters = () => {
    setFilters({
      categories: [],
      dateRange: {
        from: null,
        to: null
      },
      status: [],
      shared: null,
      starred: null
    });
    onClearFilters();
  };
  
  const hasActiveFilters = () => {
    return (
      filters.categories.length > 0 ||
      filters.status.length > 0 ||
      filters.dateRange.from !== null ||
      filters.dateRange.to !== null ||
      filters.shared !== null ||
      filters.starred !== null
    );
  };
  
  return (
    <div className={`bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
          <Filter className="w-5 h-5 text-teal-500" />
          <span>Filter Reports</span>
        </h3>
        
        {hasActiveFilters() && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-800 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>
      
      <div className="space-y-6">
        {/* Categories */}
        <div>
          <div 
            className="flex items-center justify-between cursor-pointer mb-3"
            onClick={() => toggleSection('categories')}
          >
            <h4 className="font-medium text-gray-700">Categories</h4>
            {expandedSections.categories ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </div>
          
          {expandedSections.categories && (
            <div className="space-y-2 animate-slide-down">
              {categories.map(category => (
                <div key={category.id} className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <div className="relative w-5 h-5 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category.id)}
                        onChange={() => toggleCategory(category.id)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border transition-colors ${
                        filters.categories.includes(category.id) 
                          ? 'bg-teal-500 border-teal-500' 
                          : 'border-gray-300'
                      }`} />
                      {filters.categories.includes(category.id) && (
                        <Check className="w-3 h-3 text-white absolute" />
                      )}
                    </div>
                    <span className="text-sm text-gray-700">{category.label}</span>
                  </label>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {category.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Date Range */}
        <div>
          <div 
            className="flex items-center justify-between cursor-pointer mb-3"
            onClick={() => toggleSection('dateRange')}
          >
            <h4 className="font-medium text-gray-700">Date Range</h4>
            {expandedSections.dateRange ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </div>
          
          {expandedSections.dateRange && (
            <div className="space-y-3 animate-slide-down">
              <div>
                <label className="block text-sm text-gray-600 mb-1">From</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={filters.dateRange.from || ''}
                    onChange={(e) => handleDateChange('from', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">To</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={filters.dateRange.to || ''}
                    onChange={(e) => handleDateChange('to', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() => {
                    const today = new Date();
                    const lastWeek = new Date();
                    lastWeek.setDate(today.getDate() - 7);
                    
                    setFilters(prev => ({
                      ...prev,
                      dateRange: {
                        from: lastWeek.toISOString().split('T')[0],
                        to: today.toISOString().split('T')[0]
                      }
                    }));
                  }}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  Last 7 days
                </button>
                
                <button
                  onClick={() => {
                    const today = new Date();
                    const lastMonth = new Date();
                    lastMonth.setMonth(today.getMonth() - 1);
                    
                    setFilters(prev => ({
                      ...prev,
                      dateRange: {
                        from: lastMonth.toISOString().split('T')[0],
                        to: today.toISOString().split('T')[0]
                      }
                    }));
                  }}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  Last 30 days
                </button>
                
                <button
                  onClick={() => {
                    const today = new Date();
                    const lastYear = new Date();
                    lastYear.setFullYear(today.getFullYear() - 1);
                    
                    setFilters(prev => ({
                      ...prev,
                      dateRange: {
                        from: lastYear.toISOString().split('T')[0],
                        to: today.toISOString().split('T')[0]
                      }
                    }));
                  }}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  Last year
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Status */}
        <div>
          <div 
            className="flex items-center justify-between cursor-pointer mb-3"
            onClick={() => toggleSection('status')}
          >
            <h4 className="font-medium text-gray-700">Status</h4>
            {expandedSections.status ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </div>
          
          {expandedSections.status && (
            <div className="space-y-2 animate-slide-down">
              {statuses.map(status => (
                <div key={status.id} className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <div className="relative w-5 h-5 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(status.id)}
                        onChange={() => toggleStatus(status.id)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border transition-colors ${
                        filters.status.includes(status.id) 
                          ? 'bg-teal-500 border-teal-500' 
                          : 'border-gray-300'
                      }`} />
                      {filters.status.includes(status.id) && (
                        <Check className="w-3 h-3 text-white absolute" />
                      )}
                    </div>
                    <span className="text-sm text-gray-700">{status.label}</span>
                  </label>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {status.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Other Filters */}
        <div>
          <div 
            className="flex items-center justify-between cursor-pointer mb-3"
            onClick={() => toggleSection('other')}
          >
            <h4 className="font-medium text-gray-700">Other Filters</h4>
            {expandedSections.other ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </div>
          
          {expandedSections.other && (
            <div className="space-y-3 animate-slide-down">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={filters.starred === true}
                      onChange={toggleStarred}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border transition-colors ${
                      filters.starred === true 
                        ? 'bg-yellow-500 border-yellow-500' 
                        : filters.starred === false
                          ? 'bg-red-500 border-red-500'
                          : 'border-gray-300'
                    }`} />
                    {filters.starred !== null && (
                      <Check className="w-3 h-3 text-white absolute" />
                    )}
                  </div>
                  <span className="text-sm text-gray-700">
                    {filters.starred === null 
                      ? 'Starred (Any)' 
                      : filters.starred 
                        ? 'Starred (Yes)' 
                        : 'Starred (No)'
                    }
                  </span>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={filters.shared === true}
                      onChange={toggleShared}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border transition-colors ${
                      filters.shared === true 
                        ? 'bg-purple-500 border-purple-500' 
                        : filters.shared === false
                          ? 'bg-red-500 border-red-500'
                          : 'border-gray-300'
                    }`} />
                    {filters.shared !== null && (
                      <Check className="w-3 h-3 text-white absolute" />
                    )}
                  </div>
                  <span className="text-sm text-gray-700">
                    {filters.shared === null 
                      ? 'Shared (Any)' 
                      : filters.shared 
                        ? 'Shared (Yes)' 
                        : 'Shared (No)'
                    }
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <Button
            variant="primary"
            fullWidth
            onClick={applyFilters}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};