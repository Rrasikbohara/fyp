import React, { useState, useEffect, useRef, Suspense, lazy } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import LazyLoader from "../../utils/LazyLoader";
import { HiMenu, HiX } from "react-icons/hi";
import Header from "./components/Header";
import { useAuth } from "../../contexts/AuthContext";

const Sidebar = lazy(() => import('./components/Sidebar'));

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scheduledWorkouts, setScheduledWorkouts] = useState([]);
  const sidebarRef = useRef(null);
  const { user, loading } = useAuth(); // Add loading state
  const navigate = useNavigate();

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  

  if (loading) {
    return <LazyLoader />; // Show loader while checking authentication
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header /> {/* Ensure Header is included */}
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-lg"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
      </button>

      <div className="flex flex-1 pt-16 overflow-hidden">
        {/* Responsive Sidebar */}
        <div 
          ref={sidebarRef}
          className={`transform lg:translate-x-0 fixed lg:relative inset-y-0 z-40 w-64 bg-white shadow-xl lg:shadow-none ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } transition-transform duration-300`}
        >
          <Sidebar 
            scheduledWorkouts={scheduledWorkouts}
            setScheduledWorkouts={setScheduledWorkouts}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        </div>
       
        {/* Main Content */}
        <div className="flex-1 p-4 overflow-auto ">
          <Suspense fallback={<LazyLoader/>}>
            <Outlet context={{ scheduledWorkouts, setScheduledWorkouts }} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;