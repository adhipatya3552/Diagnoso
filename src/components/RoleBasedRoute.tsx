import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User } from '../lib/supabase';

interface RoleBasedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: User['role'][];
  patientComponent?: React.ReactNode;
  doctorComponent?: React.ReactNode;
  adminComponent?: React.ReactNode;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  allowedRoles,
  patientComponent,
  doctorComponent,
  adminComponent
}) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If specific role components are provided, render based on user role
  if (patientComponent || doctorComponent || adminComponent) {
    switch (user.role) {
      case 'patient':
        return patientComponent ? <>{patientComponent}</> : <Navigate to="/" replace />;
      case 'doctor':
        return doctorComponent ? <>{doctorComponent}</> : <Navigate to="/" replace />;
      case 'admin':
        return adminComponent ? <>{adminComponent}</> : <Navigate to="/" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // If allowedRoles is specified, check if user role is allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};