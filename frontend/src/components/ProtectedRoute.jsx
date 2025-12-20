import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);

  // Check if user is authenticated
  if (userInfo) {
    return <Outlet />;
  }

  // If not authenticated, redirect to the login page
  return <Navigate to="/" replace />;
};

export default ProtectedRoute;
