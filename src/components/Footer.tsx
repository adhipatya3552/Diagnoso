import React from 'react';
import { Cross, Heart, Shield, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 bg-white/50 backdrop-blur-sm border-t border-white/20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                <Cross className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                  Diagnosa
                </h3>
                <p className="text-xs text-gray-500">Healthcare Platform</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Connecting healthcare professionals with patients worldwide through secure, innovative technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</a></li>
              <li><a href="/appointments" className="hover:text-blue-600 transition-colors">Appointments</a></li>
              <li><a href="/profile" className="hover:text-blue-600 transition-colors">Profile</a></li>
              <li><a href="/support" className="hover:text-blue-600 transition-colors">Support</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="/help" className="hover:text-blue-600 transition-colors">Help Center</a></li>
              <li><a href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
              <li><a href="/contact" className="hover:text-blue-600 transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Compliance */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Security & Compliance</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">256-bit Encryption</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-600">FDA Approved</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 Diagnosa. All rights reserved. Secure healthcare platform for the modern world.
          </p>
        </div>
      </div>
    </footer>
  );
};