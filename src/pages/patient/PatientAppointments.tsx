import React, { useState } from 'react';
import { Calendar, Clock, Video, Phone, MapPin, User, Plus, Filter, Search, Star, MessageCircle, FileText } from 'lucide-react';

export const PatientAppointments: React.FC = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const appointments = [
    {
      id: 1,
      doctor: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      date: '2025-01-02',
      time: '2:00 PM',
      duration: 30,
      type: 'video',
      status: 'confirmed',
      reason: 'Follow-up consultation for chest pain',
      avatar: 'https://images.pexels.com/photos/559827/pexels-photo-559827.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      rating: 4.9,
      location: 'Video Call',
      notes: 'Please have your recent test results ready'
    },
    {
      id: 2,
      doctor: 'Dr. Michael Chen',
      specialty: 'General Practice',
      date: '2025-01-05',
      time: '10:00 AM',
      duration: 45,
      type: 'in_person',
      status: 'scheduled',
      reason: 'Annual physical examination',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      rating: 4.8,
      location: 'Medical Center, Room 205',
      notes: 'Fasting required - no food 12 hours before'
    },
    {
      id: 3,
      doctor: 'Dr. Emily Rodriguez',
      specialty: 'Dermatology',
      date: '2025-01-08',
      time: '3:30 PM',
      duration: 30,
      type: 'phone',
      status: 'pending',
      reason: 'Skin condition follow-up',
      avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      rating: 4.9,
      location: 'Phone Consultation',
      notes: 'Have photos of affected area ready'
    }
  ];

  const pastAppointments = [
    {
      id: 4,
      doctor: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      date: '2024-12-15',
      time: '2:00 PM',
      duration: 30,
      type: 'video',
      status: 'completed',
      reason: 'Initial consultation for chest pain',
      avatar: 'https://images.pexels.com/photos/559827/pexels-photo-559827.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      rating: 4.9,
      location: 'Video Call',
      notes: 'Prescribed medication and follow-up tests'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'in_person':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'text-green-600 bg-green-50';
      case 'phone':
        return 'text-blue-600 bg-blue-50';
      case 'in_person':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const currentAppointments = activeTab === 'upcoming' ? appointments : pastAppointments;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Appointments</h1>
          <p className="text-gray-600 mt-2">Manage your healthcare appointments and consultations</p>
        </div>
        <button className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105">
          <Plus className="w-5 h-5" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Upcoming</p>
              <p className="text-2xl font-bold text-gray-800">3</p>
            </div>
            <Calendar className="w-8 h-8 text-teal-500" />
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">This Month</p>
              <p className="text-2xl font-bold text-gray-800">8</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Video Calls</p>
              <p className="text-2xl font-bold text-gray-800">5</p>
            </div>
            <Video className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-2xl font-bold text-gray-800">24</p>
            </div>
            <User className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-300 ${
              activeTab === 'upcoming'
                ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/50'
                : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50/30'
            }`}
          >
            Upcoming Appointments
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-300 ${
              activeTab === 'past'
                ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/50'
                : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50/30'
            }`}
          >
            Past Appointments
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                  placeholder="Search by doctor name, specialty, or reason"
                />
              </div>
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="scheduled">Scheduled</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="divide-y divide-gray-200">
          {currentAppointments.map((appointment) => (
            <div key={appointment.id} className="p-6 hover:bg-white/50 transition-all duration-300 group">
              <div className="flex items-start space-x-4">
                {/* Doctor Avatar */}
                <div className="relative">
                  <img
                    src={appointment.avatar}
                    alt={appointment.doctor}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-white/50 group-hover:ring-teal-300 transition-all duration-300"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${getTypeColor(appointment.type)} border-2 border-white`}>
                    {getTypeIcon(appointment.type)}
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-teal-600 transition-colors">
                        {appointment.doctor}
                      </h3>
                      <p className="text-teal-600 font-medium">{appointment.specialty}</p>
                      <p className="text-gray-600 mt-1">{appointment.reason}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">{appointment.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Date, Time, Location */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{new Date(appointment.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{appointment.time} ({appointment.duration} min)</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      {getTypeIcon(appointment.type)}
                      <span className="text-sm">{appointment.location}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {appointment.notes && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> {appointment.notes}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mt-4">
                    {appointment.status === 'confirmed' && appointment.type === 'video' && (
                      <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center space-x-2">
                        <Video className="w-4 h-4" />
                        <span>Join Video Call</span>
                      </button>
                    )}
                    
                    {activeTab === 'upcoming' && (
                      <>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center space-x-2">
                          <MessageCircle className="w-4 h-4" />
                          <span>Message Doctor</span>
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                          Reschedule
                        </button>
                        <button className="border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm">
                          Cancel
                        </button>
                      </>
                    )}
                    
                    {activeTab === 'past' && (
                      <>
                        <button className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors text-sm flex items-center space-x-2">
                          <Plus className="w-4 h-4" />
                          <span>Book Follow-up</span>
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center space-x-2">
                          <FileText className="w-4 h-4" />
                          <span>View Report</span>
                        </button>
                        <button className="border border-blue-300 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm">
                          Leave Review
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {currentAppointments.length === 0 && (
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-12 border border-white/20 shadow-lg text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No {activeTab} appointments
          </h3>
          <p className="text-gray-600 mb-6">
            {activeTab === 'upcoming' 
              ? "You don't have any upcoming appointments. Book one to get started!"
              : "You haven't had any appointments yet."
            }
          </p>
          {activeTab === 'upcoming' && (
            <button className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-teal-600 hover:to-blue-600 transition-all">
              Book Your First Appointment
            </button>
          )}
        </div>
      )}
    </div>
  );
};