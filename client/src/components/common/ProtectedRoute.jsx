import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Verifying authentication..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login, retaining return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
