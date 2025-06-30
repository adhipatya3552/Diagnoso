import React from 'react';
import { Cross } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-700 to-teal-600 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-white/20 rounded-full animate-spin border-t-white mx-auto mb-4"></div>
          <Cross className="w-8 h-8 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">Diagnosa</h2>
        <p className="text-white/80">Loading your healthcare platform...</p>
      </div>
    </div>
  );
};