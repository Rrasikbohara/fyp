import React from 'react';
import { Typography } from "@material-tailwind/react";
import { 
  UserGroupIcon, 
  ClockIcon, 
  DevicePhoneMobileIcon, 
  ShieldCheckIcon 
} from "@heroicons/react/24/outline";
import AOS from 'aos';
import 'aos/dist/aos.css';

export function Features() {
  React.useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });
  }, []);

  const features = [
    {
      icon: <UserGroupIcon className="w-6 h-6" />,
      title: "Expert Trainers",
      description: "Work with certified professional trainers who will guide you through your fitness journey."
    },
    {
      icon: <ClockIcon className="w-6 h-6" />,
      title: "24/7 Access", 
      description: "Access to our facilities around the clock, fitting your workout into your schedule."
    },
    {
      icon: <DevicePhoneMobileIcon className="w-6 h-6" />,
      title: "Mobile App",
      description: "Track your progress and book sessions through our convenient mobile application."
    },
    {
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      title: "Safe Environment",
      description: "Clean, well-maintained equipment and facilities with regular sanitization."
    }
  ];

  return (
    <section id="features" className="py-20 px-8 bg-gray-100">
      <div className="container mx-auto">
        <Typography 
          variant="h2" 
          className="text-center mb-12 text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#c8e235] to-[#9eb82a] animate-pulse hover:animate-none hover:scale-105 transition-all duration-300"
          data-aos="fade-down"
        >
          Why Choose Us
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="p-6 bg-white rounded-lg shadow-md hover:shadow-2xl hover:shadow-[#e2ff3d]/30 transform hover:scale-110 hover:-translate-y-2 transition-all duration-500 hover:border-[#e2ff3d] border-2 border-transparent cursor-pointer group animate-fadeIn"
              data-aos="zoom-in"
              data-aos-delay={index * 100}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-[#e2ff3d] to-[#c8e235] rounded-full flex items-center justify-center mb-4 transform group-hover:rotate-[360deg] group-hover:scale-110 transition-all duration-700 hover:shadow-lg hover:shadow-[#e2ff3d]/30">
                {feature.icon}
              </div>
              <Typography 
                variant="h5" 
                className="mb-3 transition-all duration-300 group-hover:text-[#c8e235] group-hover:translate-x-2 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#c8e235] group-hover:after:w-full after:transition-all after:duration-300"
              >
                {feature.title}
              </Typography>
              <Typography 
                color="gray" 
                className="font-normal transform transition-all duration-300 group-hover:translate-x-2 group-hover:text-gray-700"
              >
                {feature.description}
              </Typography>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
