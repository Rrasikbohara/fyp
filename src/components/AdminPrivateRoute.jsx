import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminPrivateRoute = ({ children }) => {
  // ...existing admin auth logic...
  const { adminUser } = useAuth();
  return adminUser ? children : <Navigate to="/admin/signin" />;
};

export default AdminPrivateRoute;
