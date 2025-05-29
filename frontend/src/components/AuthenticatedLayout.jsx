import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserAuth } from '../UserAuthContext';

const AuthenticatedLayout = ({ children }) => {
  const { user } = useUserAuth();

  if (!user) {
    // If no user is logged in, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  // If a user is logged in, render the children (the protected page)
  return <>{children}</>;
};

export default AuthenticatedLayout; 