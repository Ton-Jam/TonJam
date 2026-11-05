import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('artist' | 'collector' | 'admin')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  // Block route access until authentication AND user document verification status are fully resolved from Firestore
  if (loading || (user && !userProfile)) {
    return <LoadingScreen />;
  }

  if (!user) {
    // If offline or accessing library/downloads, allow seamless access to downloaded and local songs
    if (typeof navigator !== 'undefined' && (!navigator.onLine || location.pathname.startsWith('/library'))) {
      return <>{children}</>;
    }
    // Redirect to login if not logged in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verify role and isVerified status exclusively from the authenticated user's Firestore document
  const isAdmin = Boolean(userProfile?.role === 'admin' || userProfile?.isAdmin === true);
  const isVerifiedArtist = Boolean(
    userProfile?.role === 'artist' && 
    (userProfile?.isVerifiedArtist || userProfile?.verificationStatus === 'verified' || userProfile?.isVerified)
  );
  const userRole = isAdmin ? 'admin' : (isVerifiedArtist ? 'artist' : (userProfile?.role || 'collector'));

  if (allowedRoles) {
    if (allowedRoles.includes('artist') && !isAdmin && !isVerifiedArtist) {
      // If user attempted to access artist features but is not verified in Firestore, redirect to verification flow
      return <Navigate to="/artist-verification" replace />;
    }

    if (!allowedRoles.includes(userRole as any)) {
      // Redirect to home if role not allowed
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
