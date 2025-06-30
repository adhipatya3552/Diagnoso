import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LoadingSpinner } from './components/LoadingSpinner';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { LoginPage } from './pages/LoginPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DoctorSignup } from './pages/DoctorSignup';
import { PatientSignup } from './pages/PatientSignup';
import { SettingsPage } from './pages/SettingsPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { PatientProfile } from './pages/patient/PatientProfile';
import { FindDoctors } from './pages/patient/FindDoctors';
import { DoctorProfile } from './pages/patient/DoctorProfile';
import { PatientAppointments } from './pages/patient/PatientAppointments';
import { AppointmentBooking } from './pages/patient/AppointmentBooking';
import { AppointmentCalendarPage } from './pages/patient/AppointmentCalendarPage';
import { AppointmentReminders as PatientReminders } from './pages/patient/AppointmentReminders';
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { DoctorProfile as DoctorProfilePage } from './pages/doctor/DoctorProfile';
import { DoctorAppointments } from './pages/doctor/DoctorAppointments';
import { DoctorPatients } from './pages/doctor/DoctorPatients';
import { DoctorCalendarPage } from './pages/doctor/DoctorCalendarPage';
import { AppointmentReminders as DoctorReminders } from './pages/doctor/AppointmentReminders';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleBasedRoute } from './components/RoleBasedRoute';
import { ChatPage } from './pages/ChatPage';
import { ReportsPage } from './pages/patient/ReportsPage';
import { PrescriptionForm } from './pages/doctor/PrescriptionForm';
import { PrescriptionHistory } from './pages/doctor/PrescriptionHistory';
import { HealthDashboard } from './pages/patient/HealthDashboard';
import { NotificationsPage } from './pages/NotificationsPage';
import { NotificationToastContainer } from './components/notifications/NotificationToastContainer';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} 
          />
          <Route 
            path="/auth" 
            element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
          />
          <Route 
            path="/reset-password" 
            element={user ? <Navigate to="/dashboard" replace /> : <ResetPasswordPage />} 
          />
          <Route 
            path="/doctor/signup" 
            element={user ? <Navigate to="/dashboard" replace /> : <DoctorSignup />} 
          />
          <Route 
            path="/patient/signup" 
            element={user ? <Navigate to="/dashboard" replace /> : <PatientSignup />} 
          />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout>
                <RoleBasedRoute 
                  patientComponent={<PatientDashboard />}
                  doctorComponent={<DoctorDashboard />}
                  adminComponent={<AdminDashboard />}
                />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Settings Route - Available to all authenticated users */}
          <Route path="/settings" element={
            <ProtectedRoute>
              <DashboardLayout>
                <SettingsPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Chat Route - Available to all authenticated users */}
          <Route path="/messages" element={
            <ProtectedRoute>
              <DashboardLayout>
                <ChatPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          {/* Notifications Route - Available to all authenticated users */}
          <Route path="/notifications" element={
            <ProtectedRoute>
              <DashboardLayout>
                <NotificationsPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Patient Routes */}
          <Route path="/patient/profile" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['patient']}>
                <DashboardLayout>
                  <PatientProfile />
                </DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          <Route path="/patient/doctors" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['patient']}>
                <DashboardLayout>
                  <FindDoctors />
                </DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/patient/doctors/:id" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['patient']}>
                <DashboardLayout>
                  <DoctorProfile />
                </DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          <Route path="/patient/appointments" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['patient']}>
                <DashboardLayout>
                  <PatientAppointments />
                </DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/patient/appointment-booking" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['patient']}>
                <DashboardLayout>
                  <AppointmentBooking />
                </DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/patient/appointment-calendar" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['patient']}>
                <DashboardLayout>
                  <AppointmentCalendarPage />
                </DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/patient/reminders" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['patient']}>
                <DashboardLayout>
                  <PatientReminders />
                </DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/patient/reports" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['patient']}>
                <DashboardLayout>
                  <ReportsPage />
                </DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/patient/health" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['patient']}>
                <DashboardLayout>
                  <HealthDashboard />
                </DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          {/* Doctor Routes */}
          <Route path="/doctor/profile" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['doctor']}>
                <DashboardLayout>
                  <DoctorProfilePage />
                </DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          <Route path="/doctor/appointments" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['doctor']}>
                <DashboardLayout>
                  <DoctorAppointments />
                </DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/doctor/calendar" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['doctor']}>
                <DashboardLayout>
                  <DoctorCalendarPage />
                </DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/doctor/reminders" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['doctor']}>
                <DashboardLayout>
                  <DoctorReminders />
                </DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          <Route path="/doctor/patients" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['doctor']}>
                <DashboardLayout>
                  <DoctorPatients />
                </DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/doctor/prescriptions/new" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['doctor']}>
                <DashboardLayout>
                  <PrescriptionForm />
                </DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/doctor/prescriptions" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['doctor']}>
                <DashboardLayout>
                  <PrescriptionHistory />
                </DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </RoleBasedRoute>
            </ProtectedRoute>
          } />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Global Toast Notifications */}
        <NotificationToastContainer position="top-right" maxToasts={3} />
      </div>
    </Router>
  );
}

export default App;