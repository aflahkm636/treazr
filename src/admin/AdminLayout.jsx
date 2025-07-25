// src/layouts/AdminLayout.jsx
import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../common/context/AuthProvider';
import Loading from '../common/components/Loading';
import Sidebar from './adminSideBar';

const AdminLayout = () => {
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading name="admin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      {/* Main Content - responsive padding/margin */}
      <div className="flex-1 overflow-x-hidden">
        <div className={`transition-all duration-300 ${mobileOpen ? 'xl:ml-64' : 'ml-0 xl:ml-64'}`}>
          <Outlet context={{ mobileOpen, setMobileOpen }} />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;