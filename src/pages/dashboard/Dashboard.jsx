import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { api, getUserData } from "../../services/api";
import { toast } from "react-toastify";
import StatisticsCard from "./components/StatisticsCard";
import BookingStatistics from "./components/BookingStatistics";
import UserWelcome from "./components/UserWelcome";
import RecentBookings from "./components/RecentBookings";
import { HiUser, HiCalendar, HiClock, HiCurrencyDollar } from "react-icons/hi";

const Dashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [trainerBookings, setTrainerBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get user data using our helper function
        const userDataResult = await getUserData();
        if (userDataResult) {
          setUserData(userDataResult);
        }
        
        // Get gym bookings
        const gymResponse = await api.get('/bookings/user');
        setBookings(gymResponse.data);
        
        // Get trainer bookings
        const trainerResponse = await api.get('/trainers/bookings');
        setTrainerBookings(trainerResponse.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load some dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <UserWelcome user={user || userData} loading={loading} />
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatisticsCard
          title="Total Bookings"
          value={(bookings.length + trainerBookings.length).toString()}
          icon={<HiCalendar className="h-6 w-6" />}
          color="blue"
          loading={loading}
        />
        <StatisticsCard
          title="Upcoming Sessions"
          value={bookings.filter(b => b.status !== "cancelled" && new Date(b.bookingDate) > new Date()).length.toString()}
          icon={<HiClock className="h-6 w-6" />}
          color="purple"
          loading={loading}
        />
        <StatisticsCard
          title="Trainer Sessions"
          value={trainerBookings.length.toString()}
          icon={<HiUser className="h-6 w-6" />}
          color="green"
          loading={loading}
        />
        <StatisticsCard
          title="Total Spent"
          value={`₹${calculateTotalSpent(bookings, trainerBookings)}`}
          icon={<HiCurrencyDollar className="h-6 w-6" />}
          color="amber"
          loading={loading}
        />
      </div>
      
      {/* Booking statistics */}
      <div className="mb-6">
        <BookingStatistics bookings={bookings} trainerBookings={trainerBookings} loading={loading} />
      </div>
      
      {/* Recent bookings */}
      <div>
        <RecentBookings bookings={bookings} trainerBookings={trainerBookings} loading={loading} />
      </div>
    </div>
  );
};

// Helper function to calculate total spent
const calculateTotalSpent = (gymBookings, trainerBookings) => {
  const gymTotal = gymBookings.reduce((sum, booking) => {
    return sum + (booking.payment?.amount || 0);
  }, 0);
  
  const trainerTotal = trainerBookings.reduce((sum, booking) => {
    return sum + (booking.amount || 0);
  }, 0);
  
  return (gymTotal + trainerTotal).toFixed(2);
};

export default Dashboard;