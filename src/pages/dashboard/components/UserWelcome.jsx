import React from 'react';
import { Card, CardBody, Typography, Button } from "@material-tailwind/react";
import { HiOutlineCalendar } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const UserWelcome = ({ user, loading }) => {
  // Get time of day for greeting
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  };

  // Get a random motivation quote
  const getRandomMotivation = () => {
    const quotes = [
      "The body achieves what the mind believes.",
      "Strength doesn't come from what you can do. It comes from overcoming the things you once thought you couldn't.",
      "The only bad workout is the one that didn't happen.",
      "Your body can stand almost anything. It's your mind that you have to convince.",
      "The difference between try and triumph is just a little umph!",
      "Fitness is not about being better than someone else. It's about being better than you used to be.",
      "The hardest lift of all is lifting your butt off the couch.",
      "You don't have to be extreme, just consistent.",
      "Motivation is what gets you started. Habit is what keeps you going."
    ];
    
    // Get a random quote
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  return (
    <Card className="mb-6 overflow-hidden">
      <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1968&q=80")', 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: '0.3',
          mixBlendMode: 'overlay'
        }}></div>
        <div className="absolute bottom-0 left-0 right-0 top-0 flex flex-col justify-center p-6 text-white">
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-white bg-opacity-20 rounded w-1/3 mb-2"></div>
              <div className="h-5 bg-white bg-opacity-20 rounded w-1/2 mb-8"></div>
              <div className="h-4 bg-white bg-opacity-20 rounded w-2/3"></div>
            </div>
          ) : (
            <>
              <Typography variant="h3" className="mb-1">
                Good {getTimeOfDay()}, {user?.name?.split(' ')[0] || 'User'}!
              </Typography>
              <Typography variant="paragraph" className="opacity-80">
                Welcome back to your fitness dashboard
              </Typography>
              <Typography variant="small" className="mt-8 italic opacity-70 font-medium">
                "{getRandomMotivation()}"
              </Typography>
            </>
          )}
        </div>
      </div>
      
      <CardBody className="p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="mb-4 md:mb-0">
          <Typography variant="h6" color="blue-gray" className="mb-1">
            Your Fitness Journey
          </Typography>
          <Typography variant="small" className="text-gray-600">
            Track your progress, book sessions, and achieve your fitness goals!
          </Typography>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Link to="/dashboard/book-gym">
            <Button color="blue" className="flex items-center gap-2">
              <HiOutlineCalendar className="h-4 w-4" /> Book Gym Session
            </Button>
          </Link>
          
          <Link to="/dashboard/book-trainer">
            <Button color="blue" variant="outlined" className="flex items-center gap-2">
              <HiOutlineCalendar className="h-4 w-4" /> Book Trainer
            </Button>
          </Link>
        </div>
      </CardBody>
    </Card>
  );
};

export default UserWelcome;
