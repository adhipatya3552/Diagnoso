import React, { useState, useEffect } from 'react';
import { PatientReports } from './PatientReports';
import { ReportUploadModal, ReportData } from '../../components/ReportUploadModal';
import { ReportViewer } from '../../components/ReportViewer';
import { ReportShareModal } from '../../components/ReportShareModal';
import { ReportFilterSidebar, ReportFilters } from '../../components/ReportFilterSidebar';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const handleUploadReport = async (reportData: ReportData) => {
    if (!user) return;
    
    try {
      // In a real app, you would upload files to Supabase Storage
      // and create records in a reports table
      
      // For demo purposes, we'll just simulate a successful upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      success('Report uploaded successfully!');
      return Promise.resolve();
    } catch (err: any) {
      error(err.message || 'Failed to upload report');
      return Promise.reject(err);
    }
  };
  
  const handleShareReport = async (userIds: string[], expiryDate?: string, permissions?: string[]) => {
    try {
      // In a real app, you would create sharing records in a database
      
      // For demo purposes, we'll just simulate a successful share
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      success(`Report shared with ${userIds.length} recipients`);
      return Promise.resolve();
    } catch (err: any) {
      error(err.message || 'Failed to share report');
      return Promise.reject(err);
    }
  };
  
  const handleApplyFilters = (filters: ReportFilters) => {
    console.log('Applied filters:', filters);
    // In a real app, you would filter the reports based on these criteria
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ReportFilterSidebar
              onFilter={handleApplyFilters}
              onClearFilters={() => console.log('Filters cleared')}
            />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <PatientReports />
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <ReportUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUploadReport}
      />
      
      {showViewerModal && selectedReport && (
        <ReportViewer
          fileUrl={selectedReport.fileUrl}
          fileName={selectedReport.fileName}
          fileType={selectedReport.fileType}
          onClose={() => setShowViewerModal(false)}
        />
      )}
      
      {showShareModal && selectedReport && (
        <ReportShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          reportTitle={selectedReport.title}
          onShare={handleShareReport}
        />
      )}
    </div>
  );
};