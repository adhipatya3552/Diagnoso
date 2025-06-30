import React, { useState } from 'react';
import { Calendar, Clock, ChevronDown, ChevronUp, Filter, Search, Check, X } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  category: 'appointment' | 'medication' | 'test' | 'symptom' | 'achievement' | 'other';
  icon?: React.ComponentType<{ className?: string }>;
  status?: 'completed' | 'upcoming' | 'cancelled' | 'in-progress';
  metadata?: Record<string, any>;
}

interface HealthTimelineProps {
  events: TimelineEvent[];
  title?: string;
  showFilters?: boolean;
  className?: string;
}

export const HealthTimeline: React.FC<HealthTimelineProps> = ({
  events,
  title = 'Health Timeline',
  showFilters = true,
  className = ''
}) => {
  const [filteredEvents, setFilteredEvents] = useState<TimelineEvent[]>(events);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  
  // Sort events by date (most recent first)
  const sortedEvents = [...filteredEvents].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Group events by date
  const groupedEvents: Record<string, TimelineEvent[]> = {};
  sortedEvents.forEach(event => {
    const date = new Date(event.date).toLocaleDateString();
    if (!groupedEvents[date]) {
      groupedEvents[date] = [];
    }
    groupedEvents[date].push(event);
  });
  
  const toggleEventExpand = (id: string) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterEvents(term, selectedCategories, selectedStatus);
  };
  
  const toggleCategory = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newCategories);
    filterEvents(searchTerm, newCategories, selectedStatus);
  };
  
  const toggleStatus = (status: string) => {
    const newStatus = selectedStatus.includes(status)
      ? selectedStatus.filter(s => s !== status)
      : [...selectedStatus, status];
    
    setSelectedStatus(newStatus);
    filterEvents(searchTerm, selectedCategories, newStatus);
  };
  
  const filterEvents = (term: string, categories: string[], statuses: string[]) => {
    let filtered = [...events];
    
    // Apply search filter
    if (term) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(term.toLowerCase()) ||
        event.description?.toLowerCase().includes(term.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categories.length > 0) {
      filtered = filtered.filter(event => categories.includes(event.category));
    }
    
    // Apply status filter
    if (statuses.length > 0) {
      filtered = filtered.filter(event => event.status && statuses.includes(event.status));
    }
    
    setFilteredEvents(filtered);
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedStatus([]);
    setFilteredEvents(events);
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'appointment':
        return 'bg-blue-100 text-blue-800';
      case 'medication':
        return 'bg-purple-100 text-purple-800';
      case 'test':
        return 'bg-teal-100 text-teal-800';
      case 'symptom':
        return 'bg-red-100 text-red-800';
      case 'achievement':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        
        {showFilters && (
          <button
            onClick={() => setExpandedFilters(!expandedFilters)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>
      
      {/* Filters */}
      {showFilters && expandedFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-700">Filter Timeline</h4>
            <button
              onClick={() => setExpandedFilters(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search timeline events..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
            
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <div className="space-y-2">
                {['appointment', 'medication', 'test', 'symptom', 'achievement'].map((category) => (
                  <label key={category} className="flex items-center space-x-2 cursor-pointer">
                    <div className="relative w-5 h-5 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border transition-colors ${
                        selectedCategories.includes(category) 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'border-gray-300'
                      }`} />
                      {selectedCategories.includes(category) && (
                        <Check className="w-3 h-3 text-white absolute" />
                      )}
                    </div>
                    <span className="text-sm text-gray-700 capitalize">{category}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="space-y-2">
                {['completed', 'upcoming', 'cancelled', 'in-progress'].map((status) => (
                  <label key={status} className="flex items-center space-x-2 cursor-pointer">
                    <div className="relative w-5 h-5 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectedStatus.includes(status)}
                        onChange={() => toggleStatus(status)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border transition-colors ${
                        selectedStatus.includes(status) 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'border-gray-300'
                      }`} />
                      {selectedStatus.includes(status) && (
                        <Check className="w-3 h-3 text-white absolute" />
                      )}
                    </div>
                    <span className="text-sm text-gray-700 capitalize">{status.replace('-', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Date Range (placeholder) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    className="w-full pl-8 pr-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                    placeholder="From"
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    className="w-full pl-8 pr-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                    placeholder="To"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
      
      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-gray-200"></div>
        
        {/* Timeline Events */}
        <div className="space-y-6">
          {Object.entries(groupedEvents).map(([date, dateEvents]) => (
            <div key={date} className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center z-10">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-gray-800">{date}</h4>
                  <p className="text-sm text-gray-500">{dateEvents.length} events</p>
                </div>
              </div>
              
              <div className="ml-6 pl-8 space-y-4">
                {dateEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300"
                  >
                    <div 
                      className="p-4 cursor-pointer"
                      onClick={() => toggleEventExpand(event.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getCategoryColor(event.category)}`}>
                            {event.icon ? (
                              <event.icon className="w-4 h-4" />
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-current"></div>
                            )}
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-gray-800">{event.title}</h5>
                            {event.time && (
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>{event.time}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {event.status && (
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(event.status)}`}>
                              {event.status.replace('-', ' ')}
                            </span>
                          )}
                          
                          <button className="text-gray-400 hover:text-gray-600 transition-colors">
                            {expandedEvents.has(event.id) ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Expanded Content */}
                    {expandedEvents.has(event.id) && event.description && (
                      <div className="px-4 pb-4 pt-0 animate-slide-down">
                        <div className="pl-11">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">{event.description}</p>
                          </div>
                          
                          {/* Metadata */}
                          {event.metadata && Object.keys(event.metadata).length > 0 && (
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              {Object.entries(event.metadata).map(([key, value]) => (
                                <div key={key} className="text-xs">
                                  <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
                                  <span className="text-gray-700 font-medium">{value}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {/* Empty State */}
          {Object.keys(groupedEvents).length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-700 mb-2">No events found</h4>
              <p className="text-gray-500">
                {searchTerm || selectedCategories.length > 0 || selectedStatus.length > 0
                  ? 'Try adjusting your filters'
                  : 'Your health timeline will appear here'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};