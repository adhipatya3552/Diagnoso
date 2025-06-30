import React from 'react';
import { Calendar, Users, FileText, Clock, Heart, TrendingUp, MessageCircle, Plus, Upload, Phone, AlertCircle, Activity, Pill, Stethoscope, Video, MapPin } from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const healthMetrics = [
    { label: 'Blood Pressure', value: '120/80', status: 'normal', trend: 'stable', icon: Heart, color: 'text-green-500' },
    { label: 'Heart Rate', value: '72 bpm', status: 'normal', trend: 'stable', icon: Activity, color: 'text-blue-500' },
    { label: 'Weight', value: '165 lbs', status: 'normal', trend: 'down', icon: TrendingUp, color: 'text-purple-500' },
    { label: 'Temperature', value: '98.6°F', status: 'normal', trend: 'stable', icon: TrendingUp, color: 'text-orange-500' }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'appointment',
      title: 'Consultation with Dr. Sarah Johnson',
      description: 'Cardiology follow-up appointment completed',
      date: '2 days ago',
      icon: Stethoscope,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 2,
      type: 'report',
      title: 'Blood Test Results Available',
      description: 'Complete blood count and lipid panel results',
      date: '5 days ago',
      icon: FileText,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 3,
      type: 'prescription',
      title: 'New Prescription Added',
      description: 'Lisinopril 10mg - Take once daily',
      date: '1 week ago',
      icon: Pill,
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const upcomingAppointments = [
    {
      id: 1,
      doctor: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      date: 'Tomorrow',
      time: '2:00 PM',
      type: 'video',
      avatar: 'https://images.pexels.com/photos/559827/pexels-photo-559827.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: 2,
      doctor: 'Dr. Michael Chen',
      specialty: 'General Practice',
      date: 'Dec 30',
      time: '10:00 AM',
      type: 'in_person',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    }
  ];

  const quickActions = [
    { 
      title: 'Message Doctor', 
      description: 'Send a message to your healthcare provider',
      icon: MessageCircle, 
      color: 'from-blue-500 to-blue-600',
      action: () => console.log('Message doctor')
    },
    { 
      title: 'Book Appointment', 
      description: 'Schedule your next visit',
      icon: Calendar, 
      color: 'from-teal-500 to-teal-600',
      action: () => console.log('Book appointment')
    },
    { 
      title: 'Upload Report', 
      description: 'Share new medical documents',
      icon: Upload, 
      color: 'from-purple-500 to-purple-600',
      action: () => console.log('Upload report')
    },
    { 
      title: 'Emergency Contact', 
      description: 'Quick access to emergency services',
      icon: Phone, 
      color: 'from-red-500 to-red-600',
      action: () => console.log('Emergency contact')
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'in_person':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome back, John!</h1>
          <p className="text-gray-600 mt-2">Here's your health overview for today.</p>
        </div>
        <div className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-6 py-3 rounded-xl shadow-lg">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5" />
            <span className="font-semibold">Health Score: 85%</span>
          </div>
        </div>
      </div>

      {/* Health Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {healthMetrics.map((metric, index) => (
          <div key={index} className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                metric.status === 'normal' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {metric.status}
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.label}</h3>
            <p className="text-2xl font-bold text-gray-800 mb-2">{metric.value}</p>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <TrendingUp className={`w-4 h-4 ${metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-red-500' : 'text-gray-400'}`} />
              <span className="capitalize">{metric.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Recent Activity</h3>
            <button className="text-teal-600 hover:text-teal-800 text-sm font-medium transition-colors">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-all duration-300 group">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.color} group-hover:scale-110 transition-transform duration-300`}>
                  <activity.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 group-hover:text-teal-600 transition-colors">
                    {activity.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-2">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Upcoming</h3>
            <button className="bg-gradient-to-r from-teal-500 to-blue-500 text-white p-2 rounded-lg hover:scale-105 transition-transform duration-300">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-all duration-300 group">
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={appointment.avatar}
                    alt={appointment.doctor}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white/50 group-hover:ring-teal-300 transition-all duration-300"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-sm">{appointment.doctor}</h4>
                    <p className="text-xs text-teal-600">{appointment.specialty}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{appointment.date}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{appointment.time}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    {getTypeIcon(appointment.type)}
                    <span className="capitalize">{appointment.type.replace('_', ' ')}</span>
                  </div>
                  
                  {appointment.type === 'video' && (
                    <button className="bg-green-500 text-white px-3 py-1 rounded-full text-xs hover:bg-green-600 transition-colors">
                      Join Call
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="group p-6 bg-white/50 rounded-xl hover:bg-white/70 transition-all duration-300 hover:scale-105 hover:shadow-lg text-left"
            >
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2 group-hover:text-teal-600 transition-colors">
                {action.title}
              </h4>
              <p className="text-sm text-gray-600">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Health Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Medications */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <Pill className="w-5 h-5 text-purple-500 mr-2" />
              Current Medications
            </h3>
            <button className="text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors">
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {[
              { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', color: 'bg-blue-100 text-blue-800' },
              { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', color: 'bg-green-100 text-green-800' },
              { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', color: 'bg-purple-100 text-purple-800' }
            ].map((med, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-all duration-300">
                <div>
                  <h4 className="font-semibold text-gray-800">{med.name}</h4>
                  <p className="text-sm text-gray-600">{med.dosage} - {med.frequency}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${med.color}`}>
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Health Goals */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
              Health Goals
            </h3>
            <button className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors">
              Update Goals
            </button>
          </div>
          
          <div className="space-y-4">
            {[
              { goal: 'Weight Loss', current: '165 lbs', target: '160 lbs', progress: 60 },
              { goal: 'Blood Pressure', current: '120/80', target: '115/75', progress: 80 },
              { goal: 'Exercise', current: '3 days/week', target: '5 days/week', progress: 40 }
            ].map((goal, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-800">{goal.goal}</h4>
                  <span className="text-sm text-gray-600">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Current: {goal.current}</span>
                  <span>Target: {goal.target}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Contact Card */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 shadow-lg">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Emergency Information</h3>
            <p className="text-red-700 mb-4">
              In case of emergency, contact your primary care physician or call emergency services.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Call 911</span>
              </button>
              <button className="bg-white text-red-600 border border-red-300 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>Contact Doctor</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};