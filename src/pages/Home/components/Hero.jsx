import React from 'react';
import { Typography, Button } from "@material-tailwind/react";
import { Link } from "react-router-dom";
import AOS from 'aos';
import 'aos/dist/aos.css';

export function Hero() {
  React.useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });
  }, []);

  const scrollToTrainers = () => {
    const trainersSection = document.getElementById('trainers');
    trainersSection.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-[100svh] flex items-center justify-center bg-gradient-to-b from-gray-900 to-black overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=2070&auto=format&fit=crop"
          className="w-full h-full object-cover opacity-50 scale-105 hover:scale-110 transition-transform duration-10000"
          alt="Dynamic gym atmosphere"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
      </div>
      <div className="relative z-10 text-center p-4 sm:p-6 md:p-8 lg:p-12 w-full max-w-[90%] xl:max-w-6xl mx-auto">
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          <Typography
            variant="h1"
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white font-black tracking-tight leading-tight"
            data-aos="fade-down"
          >
            ELEVATE YOUR
            <span className="block text-[#e2ff3d] mt-1 sm:mt-2 animate-pulse">FITNESS JOURNEY</span>
          </Typography>
          <Typography
            variant="lead"
            className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-gray-200 max-w-[95%] sm:max-w-[85%] md:max-w-4xl mx-auto leading-relaxed font-light"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            Experience a revolutionary approach to fitness in our cutting-edge facility. 
            Where innovation meets inspiration, and every workout becomes a milestone in your transformation.
          </Typography>
          <div 
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 justify-center items-center mt-8 sm:mt-10 md:mt-12"
            data-aos="zoom-in"
            data-aos-delay="400"
          >
            <Link to="/auth/sign-up" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-[#e2ff3d] text-gray-900 hover:bg-white hover:text-black shadow-[0_0_20px_rgba(226,255,61,0.5)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] transform hover:scale-110 hover:-translate-y-1 transition-all duration-300 text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 font-bold animate-bounce"
              >
                START YOUR JOURNEY NOW
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outlined" 
              className="w-full sm:w-auto text-white border-2 border-white hover:border-[#e2ff3d] hover:text-[#e2ff3d] shadow-lg hover:shadow-[0_0_30px_rgba(226,255,61,0.3)] transform hover:scale-110 hover:-translate-y-1 transition-all duration-300 text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 font-bold hover:animate-pulse"
              onClick={scrollToTrainers}
            >
              MEET OUR ELITE TRAINERS
            </Button>
          </div>
        </div>
      </div>
      <div 
        className="absolute bottom-0 left-0 right-0 w-full"
        data-aos="fade-up"
        data-aos-delay="600"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto" preserveAspectRatio="none">
          <path 
            fill="#000000" 
            fillOpacity="1" 
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,128C672,128,768,160,864,176C960,192,1056,192,1152,176C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>
  );
}

export default Hero;
