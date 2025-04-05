import React, { useEffect, useState } from 'react';
import { Typography } from "@material-tailwind/react";
import TrainerCard from '../../components/TrainerCard';
import Hero from './components/Hero';
import Features from './components/Features';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import AOS from 'aos';
import 'aos/dist/aos.css';
import GymEquipments from './components/GymEquipment';
import  {api}  from '../../services/api';

const Home = () => {
  const [trainers, setTrainers] = useState([]);
  const [featuredTrainers, setFeaturedTrainers] = useState([]);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      easing: 'ease-out'
    });

    const fetchTrainers = async () => {
      try {
        const { data } = await api.get('/trainers'); // Changed from /trainer to /trainers
        setTrainers(data);
        
        // Set featured trainers (e.g., first 3 trainers)
        if (data && data.length > 0) {
          setFeaturedTrainers(data.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching trainers:', error);
      }
    };

    fetchTrainers();
  }, []);

  return (
    <main className="bg-gradient-to-b from-black to-gray-900 min-h-screen">
      <div data-aos="fade-down" className="transition-transform duration-300 ease-out hover:scale-[1.02]">
        <Hero />
      </div>
      <div data-aos="fade-up" className="transition-all duration-300 hover:shadow-lg">
        <Features />
      </div>
      <div data-aos="fade-up" className="transition-all duration-300 hover:shadow-lg">
        <GymEquipments />
      </div>
      <section id="trainers" className="py-20 px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#e2ff3d]/5 via-transparent to-[#e2ff3d]/5"></div>
        <div className="container mx-auto relative z-10">
          <Typography 
            variant="h2" 
            className="text-center mb-12 text-4xl font-bold text-white transition-colors duration-300 hover:text-[#e2ff3d]"
            data-aos="fade-down"
          >
            Meet Our Expert Trainers
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trainers.map((trainer, index) => (
              <div 
                key={trainer._id}
                data-aos="zoom-in"
                data-aos-delay={index * 150}
                className="transition-all duration-500 ease-out hover:scale-[1.05] hover:shadow-[0_0_30px_rgba(226,255,61,0.3)] rounded-xl"
              >
                <TrainerCard trainer={trainer} />
              </div>
            ))}
          </div>
        </div>
      </section>
      <div data-aos="fade-up" className="transition-transform duration-300 hover:translate-y-[-4px]">
        <Pricing />
      </div>
      <div 
        data-aos="fade-up" 
        data-aos-delay="100" 
        className="transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_0_20px_rgba(226,255,61,0.2)]"
      >
        <FAQ />
      </div>
      <div 
        data-aos="fade-up" 
        data-aos-delay="200" 
        className="transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_0_20px_rgba(226,255,61,0.2)] bg-black/50 backdrop-blur-sm rounded-lg mx-4 my-8"
      >
        <Contact />
      </div>
    </main>
  );
};

export default Home;
