import React, { useState } from 'react';
import { FileText, Download, Share2, Eye, Calendar, Filter, Search, Upload, Folder, Image, File, Star, Clock, User } from 'lucide-react';

export const PatientReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const reports = [
    {
      id: 1,
      title: 'Blood Test Results',
      category: 'Lab Results',
      date: '2024-12-28',
      doctor: 'Dr. Sarah Johnson',
      type: 'pdf',
      size: '2.4 MB',
      status: 'Normal',
      thumbnail: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      description: 'Complete blood count and lipid panel results showing normal values across all parameters.',
      tags: ['Blood Work', 'Routine', 'Normal'],
      shared: false,
      starred: true
    },
    {
      id: 2,
      title: 'Chest X-Ray',
      category: 'Imaging',
      date: '2024-12-25',
      doctor: 'Dr. Michael Chen',
      type: 'image',
      size: '5.1 MB',
      status: 'Normal',
      thumbnail: 'https://images.pexels.com/photos/7089020/pexels-photo-7089020.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      description: 'Chest X-ray showing clear lungs with no signs of infection or abnormalities.',
      tags: ['X-Ray', 'Chest', 'Clear'],
      shared: true,
      starred: false
    },
    {
      id: 3,
      title: 'Cardiology Consultation',
      category: 'Consultation Notes',
      date: '2024-12-20',
      doctor: 'Dr. Sarah Johnson',
      type: 'pdf',
      size: '1.8 MB',
      status: 'Follow-up Required',
      thumbnail: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      description: 'Detailed consultation notes from cardiology visit including treatment recommendations.',
      tags: ['Cardiology', 'Consultation', 'Follow-up'],
      shared: false,
      starred: true
    },
    {
      id: 4,
      title: 'Prescription Record',
      category: 'Prescriptions',
      date: '2024-12-18',
      doctor: 'Dr. Emily Rodriguez',
      type: 'pdf',
      size: '0.9 MB',
      status: 'Active',
      thumbnail: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      description: 'Current prescription for Lisinopril 10mg with refill information.',
      tags: ['Prescription', 'Medication', 'Active'],
      shared: false,
      starred: false
    }
  ];

  const categories = [
    { value: 'all', label: 'All Reports', count: reports.length },
    { value: 'lab', label: 'Lab Results', count: 1 },
    { value: 'imaging', label: 'Imaging', count: 1 },
    { value: 'consultation', label: 'Consultation Notes', count: 1 },
    { value: 'prescriptions', label: 'Prescriptions', count: 1 }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'abnormal':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'follow-up required':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'image':
        return <Image className="w-5 h-5 text-blue-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
                           report.category.toLowerCase().includes(selectedCategory);
    
    const matchesTab = activeTab === 'all' ||
                      (activeTab === 'starred' && report.starred) ||
                      (activeTab === 'shared' && report.shared);
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Medical Reports</h1>
          <p className="text-gray-600 mt-2">View and manage your medical documents and test results</p>
        </div>
        <button className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105">
          <Upload className="w-5 h-5" />
          <span>Upload Report</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Reports</p>
              <p className="text-2xl font-bold text-gray-800">{reports.length}</p>
            </div>
            <FileText className="w-8 h-8 text-teal-500" />
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Recent</p>
              <p className="text-2xl font-bold text-gray-800">3</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Starred</p>
              <p className="text-2xl font-bold text-gray-800">{reports.filter(r => r.starred).length}</p>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Shared</p>
              <p className="text-2xl font-bold text-gray-800">{reports.filter(r => r.shared).length}</p>
            </div>
            <Share2 className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Tabs and Controls */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-300 ${
              activeTab === 'all'
                ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/50'
                : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50/30'
            }`}
          >
            All Reports
          </button>
          <button
            onClick={() => setActiveTab('starred')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-300 ${
              activeTab === 'starred'
                ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/50'
                : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50/30'
            }`}
          >
            Starred
          </button>
          <button
            onClick={() => setActiveTab('shared')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-300 ${
              activeTab === 'shared'
                ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/50'
                : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50/30'
            }`}
          >
            Shared
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                  placeholder="Search reports, doctors, or descriptions"
                />
              </div>
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label} ({category.count})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 px-4 py-3 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-teal-500 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 px-4 py-3 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-teal-500 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Reports Grid/List */}
        <div className="p-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((report) => (
                <div key={report.id} className="bg-white/50 rounded-xl p-4 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                  {/* Report Thumbnail */}
                  <div className="relative mb-4">
                    <img
                      src={report.thumbnail}
                      alt={report.title}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute top-2 right-2 flex space-x-1">
                      {report.starred && (
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Star className="w-3 h-3 text-white fill-current" />
                        </div>
                      )}
                      {report.shared && (
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <Share2 className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-1">
                        {getFileIcon(report.type)}
                      </div>
                    </div>
                  </div>

                  {/* Report Info */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-800 group-hover:text-teal-600 transition-colors">
                        {report.title}
                      </h3>
                      <p className="text-sm text-gray-600">{report.category}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(report.date).toLocaleDateString()}</span>
                      </div>
                      <span className="text-gray-500">{report.size}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{report.doctor}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2">{report.description}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {report.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {report.tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{report.tags.length - 2}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2">
                      <button className="flex-1 bg-teal-500 text-white px-3 py-2 rounded-lg hover:bg-teal-600 transition-colors text-sm flex items-center justify-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div key={report.id} className="bg-white/50 rounded-xl p-4 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={report.thumbnail}
                        alt={report.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="absolute -top-1 -right-1">
                        {getFileIcon(report.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-800 group-hover:text-teal-600 transition-colors">
                            {report.title}
                          </h3>
                          <p className="text-sm text-gray-600">{report.category} • {report.doctor}</p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">{report.description}</p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">{new Date(report.date).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500">{report.size}</p>
                          </div>
                          
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                          
                          <div className="flex space-x-2">
                            {report.starred && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                            {report.shared && (
                              <Share2 className="w-4 h-4 text-purple-500" />
                            )}
                          </div>
                          
                          <div className="flex space-x-2">
                            <button className="bg-teal-500 text-white px-3 py-2 rounded-lg hover:bg-teal-600 transition-colors text-sm flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>View</span>
                            </button>
                            <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                            <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-12 border border-white/20 shadow-lg text-center">
          <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No reports found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCategory !== 'all' 
              ? "Try adjusting your search or filter criteria"
              : "Upload your first medical report to get started"
            }
          </p>
          <button className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-teal-600 hover:to-blue-600 transition-all">
            Upload Report
          </button>
        </div>
      )}
    </div>
  );
};