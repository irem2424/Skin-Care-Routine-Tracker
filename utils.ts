import React from 'react';
import { useAuth } from '../lib/AuthContext';
import { useLanguage } from '../lib/LanguageContext';
import { Navigate, Outlet } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';

export default function PrivateRoute() {
  const { user, loading } = useAuth();
  const { language } = useLanguage();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (!language) return <LanguageSelector />;

  return <Outlet />;
}
