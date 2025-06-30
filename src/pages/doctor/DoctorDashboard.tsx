import React from 'react';
import { Calendar, Users, Clock, DollarSign, TrendingUp, Star } from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Doctor Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your practice overview.</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5" />
            <span className="font-semibold">Rating: 4.9/5</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Today's Appointments</p>
              <p className="text-2xl font-bold text-gray-800">8</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Patients</p>
              <p className="text-2xl font-bold text-gray-800">247</p>
            </div>
            <Users className="w-8 h-8 text-teal-500" />
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Hours This Week</p>
              <p className="text-2xl font-bold text-gray-800">32</p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-800">$12,450</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Today's Schedule</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-white/50 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">John Smith</p>
                <p className="text-sm text-gray-600">9:00 AM - 9:30 AM • Video Call</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Confirmed
              </span>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-white/50 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">Maria Garcia</p>
                <p className="text-sm text-gray-600">10:00 AM - 10:30 AM • In Person</p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                Next
              </span>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-white/50 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">David Wilson</p>
                <p className="text-sm text-gray-600">11:00 AM - 11:30 AM • Phone Call</p>
              </div>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                Scheduled
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Practice Analytics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Patient Satisfaction</span>
              </div>
              <span className="text-green-600 font-semibold">98%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span className="text-gray-700">Appointments This Month</span>
              </div>
              <span className="text-blue-600 font-semibold">156</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-purple-500" />
                <span className="text-gray-700">Average Session Time</span>
              </div>
              <span className="text-purple-600 font-semibold">28 min</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-gray-700">New Reviews</span>
              </div>
              <span className="text-yellow-600 font-semibold">12</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};