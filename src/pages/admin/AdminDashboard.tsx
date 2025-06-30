import React from 'react';
import { Users, UserCheck, Shield, BarChart3, AlertTriangle, CheckCircle } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">System overview and management controls</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span className="font-semibold">System Status: Healthy</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-gray-800">1,247</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-800">23</p>
            </div>
            <UserCheck className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Doctors</p>
              <p className="text-2xl font-bold text-gray-800">189</p>
            </div>
            <Shield className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">System Alerts</p>
              <p className="text-2xl font-bold text-gray-800">3</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Pending Doctor Approvals</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-white/50 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">Dr. Sarah Johnson</p>
                <p className="text-sm text-gray-600">Cardiology • License: MD123456</p>
              </div>
              <div className="flex space-x-2">
                <button className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                  Approve
                </button>
                <button className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
                  Reject
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-white/50 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">Dr. Michael Chen</p>
                <p className="text-sm text-gray-600">General Practice • License: MD789012</p>
              </div>
              <div className="flex space-x-2">
                <button className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                  Approve
                </button>
                <button className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">System Analytics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <span className="text-gray-700">Daily Active Users</span>
              </div>
              <span className="text-blue-600 font-semibold">2,847</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Appointments Today</span>
              </div>
              <span className="text-green-600 font-semibold">156</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-purple-500" />
                <span className="text-gray-700">New Registrations</span>
              </div>
              <span className="text-purple-600 font-semibold">23</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <span className="text-gray-700">System Uptime</span>
              </div>
              <span className="text-orange-600 font-semibold">99.9%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};