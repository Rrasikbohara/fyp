import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Typography, Tab, Tabs, TabsHeader } from "@material-tailwind/react";
import Chart from 'react-apexcharts';
import { HiCalendar, HiClock } from 'react-icons/hi';

const BookingStatistics = ({ bookings = [], trainerBookings = [], loading = false }) => {
  const [activeTab, setActiveTab] = useState('weekly');
  const [chartData, setChartData] = useState({
    options: {
      chart: {
        id: "basic-bar",
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },
      xaxis: {
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      colors: ['#3b82f6', '#8b5cf6'],
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.5,
          opacityFrom: 0.7,
          opacityTo: 0.2
        }
      },
      dataLabels: {
        enabled: false
      },
      legend: {
        position: 'top'
      },
      tooltip: {
        y: {
          formatter: function (value) {
            return value + ' bookings';
          }
        }
      }
    },
    series: [
      {
        name: "Gym",
        data: [0, 0, 0, 0, 0, 0, 0]
      },
      {
        name: "Trainer",
        data: [0, 0, 0, 0, 0, 0, 0]
      }
    ]
  });

  // Process booking data when component loads or when bookings/tab changes
  useEffect(() => {
    if (loading) return;
    
    const processBookingData = () => {
      const today = new Date();
      let startDate, endDate;
      let dateLabels = [];
      
      // Determine date range based on active tab
      switch(activeTab) {
        case 'weekly':
          // Set to beginning of current week (Sunday)
          startDate = new Date(today);
          startDate.setDate(today.getDate() - today.getDay());
          
          // Set to end of week (Saturday)
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          
          // Generate day labels
          for (let i = 0; i <= 6; i++) {
            const day = new Date(startDate);
            day.setDate(startDate.getDate() + i);
            dateLabels.push(day.toLocaleDateString('en-US', { weekday: 'short' }));
          }
          break;
          
        case 'monthly':
          // Set to first day of current month
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          
          // Set to last day of current month
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          
          // Generate week labels for the month
          const totalDays = endDate.getDate();
          const weeks = Math.ceil(totalDays / 7);
          
          for (let i = 0; i < weeks; i++) {
            dateLabels.push(`Week ${i + 1}`);
          }
          break;
          
        case 'yearly':
          // Set to first day of current year
          startDate = new Date(today.getFullYear(), 0, 1);
          
          // Set to last day of current year
          endDate = new Date(today.getFullYear(), 11, 31);
          
          // Generate month labels
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          dateLabels = [...months];
          break;
      }
      
      // Initialize arrays to hold counts
      let gymCounts = Array(dateLabels.length).fill(0);
      let trainerCounts = Array(dateLabels.length).fill(0);
      
      // Process gym bookings
      bookings.forEach(booking => {
        const bookingDate = new Date(booking.bookingDate);
        
        // Skip if outside our range
        if (bookingDate < startDate || bookingDate > endDate) return;
        
        let index = 0;
        
        if (activeTab === 'weekly') {
          // Get day of week (0-6)
          index = bookingDate.getDay();
        } else if (activeTab === 'monthly') {
          // Get week of month (0-based)
          index = Math.floor((bookingDate.getDate() - 1) / 7);
        } else if (activeTab === 'yearly') {
          // Get month (0-11)
          index = bookingDate.getMonth();
        }
        
        if (index >= 0 && index < gymCounts.length) {
          gymCounts[index]++;
        }
      });
      
      // Process trainer bookings
      trainerBookings.forEach(booking => {
        const bookingDate = new Date(booking.sessionDate);
        
        // Skip if outside our range
        if (bookingDate < startDate || bookingDate > endDate) return;
        
        let index = 0;
        
        if (activeTab === 'weekly') {
          // Get day of week (0-6)
          index = bookingDate.getDay();
        } else if (activeTab === 'monthly') {
          // Get week of month (0-based)
          index = Math.floor((bookingDate.getDate() - 1) / 7);
        } else if (activeTab === 'yearly') {
          // Get month (0-11)
          index = bookingDate.getMonth();
        }
        
        if (index >= 0 && index < trainerCounts.length) {
          trainerCounts[index]++;
        }
      });
      
      // Update chart data
      setChartData({
        options: {
          ...chartData.options,
          xaxis: {
            categories: dateLabels
          }
        },
        series: [
          {
            name: "Gym",
            data: gymCounts
          },
          {
            name: "Trainer",
            data: trainerCounts
          }
        ]
      });
    };
    
    processBookingData();
  }, [bookings, trainerBookings, activeTab, loading]);

  return (
    <Card className="shadow-lg">
      <CardHeader 
        floated={false} 
        shadow={false} 
        className="rounded-none bg-transparent"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 px-4 pt-4">
          <div className="flex items-center gap-2">
            <HiCalendar className="h-6 w-6 text-blue-600" />
            <Typography variant="h5" color="blue-gray">
              Booking Statistics
            </Typography>
          </div>
          
          <Tabs value={activeTab} className="w-full md:w-auto">
            <TabsHeader className="bg-gray-100">
              <Tab 
                value="weekly" 
                onClick={() => setActiveTab("weekly")}
                className={activeTab === "weekly" ? "font-medium" : ""}
              >
                Weekly
              </Tab>
              <Tab 
                value="monthly" 
                onClick={() => setActiveTab("monthly")}
                className={activeTab === "monthly" ? "font-medium" : ""}
              >
                Monthly
              </Tab>
              <Tab 
                value="yearly" 
                onClick={() => setActiveTab("yearly")}
                className={activeTab === "yearly" ? "font-medium" : ""}
              >
                Yearly
              </Tab>
            </TabsHeader>
          </Tabs>
        </div>
      </CardHeader>
      
      <CardBody className="px-0 pt-0">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="h-64 p-4">
            {bookings.length === 0 && trainerBookings.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center">
                <HiClock className="h-12 w-12 text-gray-300 mb-3" />
                <Typography color="gray" className="font-medium">
                  No booking data to display
                </Typography>
                <Typography color="gray" className="text-sm">
                  Your booking statistics will appear here
                </Typography>
              </div>
            ) : (
              <Chart
                options={chartData.options}
                series={chartData.series}
                type="area"
                height="100%"
              />
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default BookingStatistics;
