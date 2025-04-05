import React from 'react';
import { NavLink } from 'react-router-dom';
import { HiOutlineChartBar, HiOutlineBookOpen, HiOutlineUserGroup, HiOutlineCollection, HiOutlineOfficeBuilding, HiOutlineUser, HiOutlineSearch, HiOutlineLogout } from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';

const AdminSidebar = ({ collapsed, onLinkClick }) => {
  const { adminLogout } = useAuth();

  return (
    <aside className={`flex flex-col ${collapsed ? 'items-center' : 'pl-4'} space-y-4 h-full`}>
      <NavLink to="/admin/dashboard" onClick={onLinkClick} className="w-full text-center text-2xl font-bold text-indigo-400 mb-4">
        {collapsed ? 'AP' : 'Admin Panel'}
      </NavLink>
      <nav className="space-y-2 flex-1">
        <NavLink to="/admin/dashboard" onClick={onLinkClick} className={({ isActive }) => 
          `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
        }>
          <HiOutlineChartBar className="mr-2 w-5 h-5" /> Dashboard
        </NavLink>
        <NavLink to="/admin/gym-bookings" onClick={onLinkClick} className={({ isActive }) => 
          `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
        }>
          <HiOutlineBookOpen className="mr-2 w-5 h-5" /> Gym Bookings
        </NavLink>
        <NavLink to="/admin/trainer-bookings" onClick={onLinkClick} className={({ isActive }) => 
          `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
        }>
          <HiOutlineUserGroup className="mr-2 w-5 h-5" /> Trainer Bookings
        </NavLink>
        {/* <NavLink to="/admin/equipment-bookings" onClick={onLinkClick} className={({ isActive }) => 
          `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
        }>
          <HiOutlineCollection className="mr-2 w-5 h-5" /> Equipment Bookings
        </NavLink> */}
      
        <NavLink to="/admin/users" onClick={onLinkClick} className={({ isActive }) => 
          `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
        }>
          <HiOutlineUser className="mr-2 w-5 h-5" /> Users
        </NavLink>
        <NavLink to="/admin/equipments" onClick={onLinkClick} className={({ isActive }) => 
          `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
        }>
          <HiOutlineOfficeBuilding className="mr-2 w-5 h-5" /> Equipments
        </NavLink>
        <NavLink to="/admin/trainers" onClick={onLinkClick} className={({ isActive }) => 
          `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
        }>
          <HiOutlineSearch className="mr-2 w-5 h-5" /> Trainers
        </NavLink>
        <NavLink to="/admin/feedback" onClick={onLinkClick} className={({ isActive }) => 
          `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
        }>
          <HiOutlineOfficeBuilding className="mr-2 w-5 h-5" /> Feedback
        </NavLink>
      </nav>
      <button onClick={adminLogout} className="flex items-center p-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
        <HiOutlineLogout className="mr-2 w-5 h-5" /> Logout
      </button>
    </aside>
  );
};

export default AdminSidebar;
