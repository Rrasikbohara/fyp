import React from 'react';
import { Typography, Input, Textarea, Button } from "@material-tailwind/react";
import AOS from 'aos';
import 'aos/dist/aos.css';

export function Contact() {
  React.useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic',
      disable: window.innerWidth < 768
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
  };

  return (
    <section id="contact" className="py-24 px-8 relative bg-gray-100">
      <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-gray-100/95 to-white/90 backdrop-blur-sm"></div>
      <div className="container mx-auto relative z-10">
        <Typography 
          variant="h2" 
          className="text-center mb-16 text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#c8e235] to-[#9eb82a] hover:scale-110 transition-transform duration-300"
          data-aos="fade-down"
        >
          Let's Connect
        </Typography>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-7xl mx-auto">
          <div 
            data-aos="fade-right"
            data-aos-duration="600"
            className="backdrop-blur-md bg-white/80 p-8 rounded-2xl border border-gray-200 hover:border-[#c8e235] transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-[#c8e235]/30 hover:scale-[1.02] hover:-translate-y-1"
          >
            <Typography variant="h5" className="mb-6 text-[#9eb82a] font-bold hover:text-[#c8e235] transition-colors duration-300">
              Get in Touch
            </Typography>
            <Typography className="mb-10 text-gray-700">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </Typography>
            <div className="space-y-8">
              <div className="flex items-center space-x-6 transform hover:translate-x-4 transition-all duration-500 hover:scale-105">
                <div className="w-14 h-14 bg-gradient-to-br from-[#c8e235] to-[#9eb82a] rounded-full flex items-center justify-center shadow-lg shadow-[#c8e235]/20 hover:shadow-xl hover:shadow-[#c8e235]/40 transition-all duration-700">
                  <i className="fas fa-map-marker-alt text-white text-xl"></i>
                </div>
                <div>
                  <Typography variant="h6" className="text-gray-800 hover:text-[#c8e235] transition-colors duration-300">Location</Typography>
                  <Typography className="text-gray-600">123 Fitness Street, Gym City, GC 12345</Typography>
                </div>
              </div>
              <div className="flex items-center space-x-6 transform hover:translate-x-4 transition-all duration-500 hover:scale-105">
                <div className="w-14 h-14 bg-gradient-to-br from-[#c8e235] to-[#9eb82a] rounded-full flex items-center justify-center shadow-lg shadow-[#c8e235]/20 hover:shadow-xl hover:shadow-[#c8e235]/40 transition-all duration-700">
                  <i className="fas fa-phone text-white text-xl"></i>
                </div>
                <div>
                  <Typography variant="h6" className="text-gray-800 hover:text-[#c8e235] transition-colors duration-300">Phone</Typography>
                  <Typography className="text-gray-600">+1 (555) 123-4567</Typography>
                </div>
              </div>
              <div className="flex items-center space-x-6 transform hover:translate-x-4 transition-all duration-500 hover:scale-105">
                <div className="w-14 h-14 bg-gradient-to-br from-[#c8e235] to-[#9eb82a] rounded-full flex items-center justify-center shadow-lg shadow-[#c8e235]/20 hover:shadow-xl hover:shadow-[#c8e235]/40 transition-all duration-700">
                  <i className="fas fa-envelope text-white text-xl"></i>
                </div>
                <div>
                  <Typography variant="h6" className="text-gray-800 hover:text-[#c8e235] transition-colors duration-300">Email</Typography>
                  <Typography className="text-gray-600">info@gymmanagement.com</Typography>
                </div>
              </div>
            </div>
          </div>
          <form 
            onSubmit={handleSubmit}
            data-aos="fade-left"
            data-aos-duration="600"
            className="space-y-8 backdrop-blur-md bg-white/80 p-8 rounded-2xl border border-gray-200 hover:border-[#c8e235] transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-[#c8e235]/30 hover:scale-[1.02] hover:-translate-y-1"
          >
            <div className="grid grid-cols-2 gap-6">
              <Input 
                label="First Name" 
                required 
                className="!border-gray-300 focus:!border-[#c8e235] text-gray-800 hover:scale-105 transition-transform duration-300"
                labelProps={{ className: "text-gray-700" }}
              />
              <Input 
                label="Last Name" 
                required
                className="!border-gray-300 focus:!border-[#c8e235] text-gray-800 hover:scale-105 transition-transform duration-300"
                labelProps={{ className: "text-gray-700" }}
              />
            </div>
            <Input 
              type="email" 
              label="Email" 
              required
              className="!border-gray-300 focus:!border-[#c8e235] text-gray-800 hover:scale-105 transition-transform duration-300"
              labelProps={{ className: "text-gray-700" }}
            />
            <Input 
              type="tel" 
              label="Phone"
              className="!border-gray-300 focus:!border-[#c8e235] text-gray-800 hover:scale-105 transition-transform duration-300"
              labelProps={{ className: "text-gray-700" }}
            />
            <Textarea 
              label="Message" 
              required
              className="!border-gray-300 focus:!border-[#c8e235] text-gray-800 hover:scale-105 transition-transform duration-300"
              labelProps={{ className: "text-gray-700" }}
              rows={4}
            />
            <Button
              type="submit"
              className="bg-gradient-to-r from-[#c8e235] to-[#9eb82a] text-white hover:shadow-lg hover:shadow-[#c8e235]/40 transform hover:scale-110 hover:-translate-y-1 transition-all duration-300 w-full"
              size="lg"
            >
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;
