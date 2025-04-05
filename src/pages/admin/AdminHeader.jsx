import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineLogout } from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';

const AdminHeader = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/sign-in');
  };

  return (
    <header className="w-full bg-indigo-700 text-white p-4 flex justify-between items-center shadow-md">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <button onClick={handleLogout} className="flex items-center hover:text-gray-300">
        <HiOutlineLogout className="mr-2 h-6 w-6" /> Logout
      </button>
    </header>
  );
};

export default AdminHeader;
