import React from 'react';
import { MessageSquare } from 'lucide-react';

export const EmptyConversation: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <MessageSquare className="w-12 h-12 text-white/70" />
      </div>
      
      <h3 className="text-2xl font-semibold text-white mb-4">Welcome to Diagnosa Chat</h3>
      <p className="text-white/70 max-w-md mb-6">
        Connect with your healthcare providers through secure, end-to-end encrypted messaging
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <h4 className="font-medium text-white mb-2">For Patients</h4>
          <p className="text-sm text-white/70">
            Message your doctors, ask questions about your treatment, and get quick responses
          </p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <h4 className="font-medium text-white mb-2">For Doctors</h4>
          <p className="text-sm text-white/70">
            Stay connected with your patients, provide guidance, and monitor their progress
          </p>
        </div>
      </div>
      
      <p className="text-white/50 text-sm mt-8">
        Select a conversation from the sidebar or start a new one
      </p>
    </div>
  );
};