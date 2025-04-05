import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { toast, ToastContainer } from 'react-toastify';
import { HiOutlineMenuAlt3, HiX } from 'react-icons/hi';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // used only on mobile if needed
  const [adminData, setAdminData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await api.get('/admin/summary');
        setAdminData(res.data);
      } catch (error) {
        toast.error("Failed to load admin data");
      }
    };
    fetchAdminData();
  }, []);

  const gymBookingStats = adminData?.gymBookingStats || [];
  const trainerBookingStats = adminData?.trainerBookingStats || [];

  const gymChartData = {
    labels: gymBookingStats.map(stat => stat._id),
    datasets: [
      {
        label: 'Gym Bookings',
        data: gymBookingStats.map(stat => stat.count),
        fill: false,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
      },
    ],
  };

  const trainerChartData = {
    labels: trainerBookingStats.map(stat => stat._id),
    datasets: [
      {
        label: 'Trainer Bookings',
        data: trainerBookingStats.map(stat => stat.count),
        fill: false,
        backgroundColor: 'rgba(153,102,255,0.4)',
        borderColor: 'rgba(153,102,255,1)',
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile Header */}
      <div className="bg-indigo-600 text-white p-3 md:hidden flex justify-between items-center">
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <HiX className="w-6 h-6" /> : <HiOutlineMenuAlt3 className="w-6 h-6" />}
        </button>
        <h1 className="text-base font-bold">Admin Dashboard</h1>
      </div>
      {/* Main Content provided by AdminPanelLayout (no extra left margin here) */}
      <div className="p-6">
        <header className="hidden md:flex items-center justify-between border-b pb-4 mb-4">
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <div className="text-lg">Welcome, {adminData?.adminName || 'Admin'}</div>
        </header>
        <main className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-2">Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-lg shadow-lg cursor-pointer" onClick={() => navigate('/admin/gym-bookings')}>
                <p className="text-sm text-gray-500">Total Gym Bookings</p>
                <p className="text-3xl font-bold">{adminData?.totalGymBookings || 0}</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-lg cursor-pointer" onClick={() => navigate('/admin/trainer-bookings')}>
                <p className="text-sm text-gray-500">Total Trainer Bookings</p>
                <p className="text-3xl font-bold">{adminData?.totalTrainerBookings || 0}</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <p className="text-sm text-gray-500">Confirmed Gym Bookings</p>
                <p className="text-3xl font-bold">{adminData?.confirmedGymBookings || 0}</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <p className="text-sm text-gray-500">Confirmed Trainer Bookings</p>
                <p className="text-3xl font-bold">{adminData?.confirmedTrainerBookings || 0}</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <p className="text-sm text-gray-500">Pending Gym Bookings</p>
                <p className="text-3xl font-bold">{adminData?.pendingGymBookings || 0}</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <p className="text-sm text-gray-500">Pending Trainer Bookings</p>
                <p className="text-3xl font-bold">{adminData?.pendingTrainerBookings || 0}</p>
              </div>
            </div>
          </section>
          <section>
            <h3 className="text-xl font-semibold mb-2">Gym Booking Trends</h3>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <Line data={gymChartData} />
            </div>
          </section>
          <section>
            <h3 className="text-xl font-semibold mb-2">Trainer Booking Trends</h3>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <Line data={trainerChartData} />
            </div>
          </section>
          <section>
            <h3 className="text-xl font-semibold mb-2">Recent Activity</h3>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <p className="text-lg">No recent activity.</p>
            </div>
          </section>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AdminDashboard;
