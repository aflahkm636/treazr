import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Loading from '../common/components/Loading';
import Sidebar from './adminSideBar';
import { useAuth } from '../common/context/AuthProvider';
import { useTheme } from '../common/context/Darkthemeprovider';

const AdminLayout = () => {
  const { user, loading } = useAuth();
  const { darkMode } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <Loading name="admin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" />;
  }

  return (
    <div className={`min-h-screen flex ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} darkMode={darkMode} />
      <div className="flex-1 overflow-x-hidden">
        <div className={`transition-all duration-300 ${mobileOpen ? 'xl:ml-64' : 'ml-0 xl:ml-64'}`}>
          <Outlet context={{ mobileOpen, setMobileOpen }} />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;