import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Typography,
  Button,
  Chip
} from "@material-tailwind/react";
import { 
  HiOutlineCalendar, 
  HiOutlineArrowRight,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineLocationMarker
} from 'react-icons/hi';
import { Link } from 'react-router-dom';

const RecentBookings = ({ bookings = [], trainerBookings = [], loading = false }) => {
  // Combine and sort all bookings by date (most recent first)
  const allBookings = [...bookings, ...trainerBookings]
    .sort((a, b) => {
      const dateA = new Date(a.bookingDate || a.sessionDate || a.createdAt);
      const dateB = new Date(b.bookingDate || b.sessionDate || b.createdAt);
      return dateB - dateA; // Most recent first
    })
    .slice(0, 5); // Get only the most recent 5
    
  // Format date nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };
  
  // Status badge component
  const StatusBadge = ({ status }) => {
    let color = 'blue-gray';
    
    switch (status?.toLowerCase()) {
      case 'confirmed':
        color = 'green';
        break;
      case 'pending':
        color = 'amber';
        break;
      case 'cancelled':
        color = 'red';
        break;
      case 'completed':
        color = 'blue';
        break;
      default:
        color = 'blue-gray';
    }
    
    return (
      <Chip
        value={status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase() || 'Unknown'}
        size="sm"
        color={color}
        variant="ghost"
        className="text-xs font-medium"
      />
    );
  };

  return (
    <Card className="shadow-lg">
      <CardHeader 
        floated={false} 
        shadow={false} 
        className="rounded-none bg-transparent"
      >
        <div className="flex items-center justify-between mb-2 px-4 pt-4">
          <div className="flex items-center gap-2">
            <HiOutlineCalendar className="h-6 w-6 text-blue-600" />
            <Typography variant="h5" color="blue-gray">
              Recent Bookings
            </Typography>
          </div>
          
          <Link to="/dashboard/profile">
            <Button 
              color="blue" 
              variant="text" 
              size="sm"
              className="flex items-center gap-2"
            >
              View All <HiOutlineArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardBody className="px-0 pt-0 pb-2">
        {loading ? (
          <div className="p-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="animate-pulse flex p-4 border-b border-gray-200">
                <div className="bg-gray-200 h-14 w-14 rounded-lg mr-4"></div>
                <div className="flex-1">
                  <div className="bg-gray-200 h-4 w-1/3 rounded mb-2"></div>
                  <div className="bg-gray-200 h-3 w-1/4 rounded mb-1"></div>
                  <div className="bg-gray-200 h-3 w-1/5 rounded"></div>
                </div>
                <div className="bg-gray-200 h-6 w-16 rounded"></div>
              </div>
            ))}
          </div>
        ) : allBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <HiOutlineCalendar className="h-12 w-12 text-gray-300 mb-3" />
            <Typography color="gray" className="font-medium mb-1">
              No bookings yet
            </Typography>
            <Typography color="gray" className="text-sm mb-4">
              Book your first gym session or trainer appointment
            </Typography>
            <div className="flex gap-2">
              <Link to="/dashboard/book-gym">
                <Button color="blue" size="sm">Book Gym</Button>
              </Link>
              <Link to="/dashboard/book-trainer">
                <Button color="blue" variant="outlined" size="sm">Book Trainer</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max table-auto text-left">
              <thead>
                <tr>
                  <th className="border-b border-gray-200 bg-gray-50 p-4">
                    <Typography 
                      variant="small" 
                      color="blue-gray" 
                      className="font-medium opacity-70"
                    >
                      Type
                    </Typography>
                  </th>
                  <th className="border-b border-gray-200 bg-gray-50 p-4">
                    <Typography 
                      variant="small" 
                      color="blue-gray" 
                      className="font-medium opacity-70"
                    >
                      Details
                    </Typography>
                  </th>
                  <th className="border-b border-gray-200 bg-gray-50 p-4">
                    <Typography 
                      variant="small" 
                      color="blue-gray" 
                      className="font-medium opacity-70"
                    >
                      Date
                    </Typography>
                  </th>
                  <th className="border-b border-gray-200 bg-gray-50 p-4">
                    <Typography 
                      variant="small" 
                      color="blue-gray" 
                      className="font-medium opacity-70 text-center"
                    >
                      Status
                    </Typography>
                  </th>
                </tr>
              </thead>
              <tbody>
                {allBookings.map((booking, index) => {
                  // Determine if this is a gym booking or trainer booking
                  const isGym = booking.workoutType !== undefined;
                  const dateForBooking = isGym ? booking.bookingDate : booking.sessionDate;
                  
                  return (
                    <tr key={booking._id || index} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isGym ? 'bg-blue-100' : 'bg-purple-100'}`}>
                            {isGym ? (
                              <span role="img" aria-label="gym" className="text-xl">🏋️</span>
                            ) : (
                              <span role="img" aria-label="trainer" className="text-xl">👨‍🏫</span>
                            )}
                          </div>
                          <Typography variant="small" color="blue-gray" className="font-medium">
                            {isGym ? 'Gym' : 'Trainer'}
                          </Typography>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div>
                          <Typography variant="small" color="blue-gray" className="font-medium">
                            {isGym 
                              ? `${booking.workoutType} Session` 
                              : `Session with ${booking.trainer?.name || 'Trainer'}`
                            }
                          </Typography>
                          
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1">
                              <HiOutlineClock className="h-3.5 w-3.5 text-gray-500" />
                              <Typography variant="small" className="text-xs text-gray-600">
                                {isGym ? `${booking.startTime} - ${booking.endTime}` : booking.time}
                              </Typography>
                            </div>
                            
                            {isGym ? (
                              <div className="flex items-center gap-1">
                                <HiOutlineLocationMarker className="h-3.5 w-3.5 text-gray-500" />
                                <Typography variant="small" className="text-xs text-gray-600">
                                  Main Gym
                                </Typography>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <HiOutlineUser className="h-3.5 w-3.5 text-gray-500" />
                                <Typography variant="small" className="text-xs text-gray-600">
                                  {booking.trainer?.specialization || 'Personal Training'}
                                </Typography>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <Typography variant="small" color="blue-gray" className="font-medium">
                          {formatDate(dateForBooking)}
                        </Typography>
                      </td>
                      
                      <td className="p-4 text-center">
                        <StatusBadge status={booking.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default RecentBookings;
