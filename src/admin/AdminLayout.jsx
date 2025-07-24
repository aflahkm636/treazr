// src/layouts/AdminLayout.jsx
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../common/context/AuthProvider';
import Loading from '../common/components/Loading';

const AdminLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>
      <Loading name="admin"/>
    </div>;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default AdminLayout;