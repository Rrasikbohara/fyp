import React, { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import LazyLoader from '../utils/LazyLoader';

// This file is no longer needed as admin routes are now handled directly in App.jsx
// We keep it for backward compatibility and redirect to the main admin dashboard
const AdminRoutes = () => {
  console.log('AdminRoutes component is deprecated, routes are now handled in App.jsx');
  return (
    <Suspense fallback={<LazyLoader />}>
      <Navigate to="/admin" replace />
    </Suspense>
  );
};

export default AdminRoutes;
