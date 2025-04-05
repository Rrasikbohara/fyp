import React from "react";
import { NavLink } from "react-router-dom";
import { 
  HiHome, 
  HiCalendar, 
  HiUser , 
  HiCog,
  HiCurrencyDollar,
  HiBookOpen,
  HiUserGroup,
  HiOutlineLogout
} from "react-icons/hi";
import { useAuth } from "../../../contexts/AuthContext";

const Sidebar = ({ scheduledWorkouts }) => {
  const { logout } = useAuth();

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 lg:py-8 sm:py-16 flex flex-col">
      {/* Navigation Menu */}
      <nav className="p-2 space-y-1 flex-1">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `flex items-center p-3 rounded-lg ${
            isActive 
              ? 'bg-blue-100 text-blue-600 font-semibold' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <HiHome className="mr-3 w-5 h-5" /> 
          Home
        </NavLink>
        
        <NavLink 
          to="/dashboard/schedule" 
          className={({ isActive }) => `flex items-center p-3 rounded-lg ${
            isActive 
              ? 'bg-blue-100 text-blue-600 font-semibold' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <HiCalendar className="mr-3 w-5 h-5" /> 
          Workout Schedule
        </NavLink>
        <NavLink 
          to="/dashboard/nutritions" 
          className={({ isActive }) => `flex items-center p-3 rounded-lg ${
            isActive 
              ? 'bg-blue-100 text-blue-600 font-semibold' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <HiCalendar className="mr-3 w-5 h-5" /> 
          Nutritions
        </NavLink>
        
        <NavLink 
          to="/dashboard/transactions" 
          className={({ isActive }) => `flex items-center p-3 rounded-lg ${
            isActive 
              ? 'bg-blue-100 text-blue-600 font-semibold' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <HiCurrencyDollar className="mr-3 w-5 h-5" /> 
          Transactions
        </NavLink>
        <NavLink 
          to="/dashboard/exercices" 
          className={({ isActive }) => `flex items-center p-3 rounded-lg ${
            isActive 
              ? 'bg-blue-100 text-blue-600 font-semibold' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <HiCog className="mr-3 w-5 h-5" />
          Exercices
        </NavLink>
        <NavLink 
          to="/dashboard/book-gym" 
          className={({ isActive }) => `flex items-center p-3 rounded-lg ${
            isActive 
              ? 'bg-blue-100 text-blue-600 font-semibold' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <HiBookOpen className="mr-3 w-5 h-5" /> 
          Book Gym
        </NavLink>
        
        <NavLink 
          to="/dashboard/book-trainer" 
          className={({ isActive }) => `flex items-center p-3 rounded-lg ${
            isActive 
              ? 'bg-blue-100 text-blue-600 font-semibold' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <HiUserGroup className="mr-3 w-5 h-5" /> 
          Book Trainer
        </NavLink>
        <NavLink 
          to="/dashboard/profile" 
          className={({ isActive }) => `flex items-center p-3 rounded-lg ${
            isActive 
              ? 'bg-blue-100 text-blue-600 font-semibold' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <HiUser  className="mr-3 w-5 h-5" /> 
          Profile
        </NavLink>
      </nav>

      {/* Upcoming Workouts Section */}
      <div className="mt-auto border-t p-4 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">
          Upcoming Workouts
        </h3>
        <div className="space-y-2">
          {scheduledWorkouts.slice(0, 3).map(workout => (
            <div 
              key={workout.id} 
              className="text-sm p-2 bg-white rounded-lg shadow-sm border border-gray-100"
            >
              <div className="font-medium text-gray-700">{workout.day}</div>
              <div className="text-gray-500 truncate">{workout.exercise}</div>
            </div>
          ))}
        </div>
       
      </div>

     
    </div>
  );
};

export default Sidebar;