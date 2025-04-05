import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { HiOutlineMenuAlt3, HiX } from 'react-icons/hi';
import AdminSidebar from './AdminSidebar';

const AdminPanelLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => setMobileSidebarOpen(prev => !prev);
  const closeMobileSidebar = () => setMobileSidebarOpen(false);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-100">
      {/* Mobile Header */}
      <div className="bg-indigo-600 text-white p-3 lg:hidden flex justify-between items-center">
        <button onClick={toggleMobileSidebar}>
          {mobileSidebarOpen ? <HiX className="w-6 h-6" /> : <HiOutlineMenuAlt3 className="w-6 h-6" />}
        </button>
        <h1 className="text-base font-bold">Admin Dashboard</h1>
      </div>
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block h-full">
          <div className={`transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} bg-gray-900 text-white border-r border-gray-700 h-full`}>
            <div className="flex justify-end p-2">
              <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                {sidebarCollapsed ? <HiOutlineMenuAlt3 className="w-6 h-6" /> : <HiX className="w-6 h-6" />}
              </button>
            </div>
            <AdminSidebar collapsed={sidebarCollapsed} onLinkClick={() => {}} />
          </div>
        </div>
        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 lg:hidden">
            <div className="absolute top-0 left-0 w-64 bg-gray-900 text-white h-full p-4">
              <div className="flex justify-end">
                <button onClick={closeMobileSidebar}>
                  <HiX className="w-6 h-6" />
                </button>
              </div>
              <AdminSidebar collapsed={false} onLinkClick={closeMobileSidebar} />
            </div>
          </div>
        )}
        {/* Main Panel */}
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminPanelLayout;
