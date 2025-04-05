import React from 'react';
import { Typography, Card, CardBody, CardFooter, Button } from "@material-tailwind/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import AOS from 'aos';
import 'aos/dist/aos.css';

export function Pricing() {
  React.useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });
  }, []);

  const plans = [
    {
      name: "Basic",
      price: "29",
      features: [
        "Access to gym equipment",
        "Locker room access", 
        "Basic fitness assessment",
        "2 group classes per month"
      ]
    },
    {
      name: "Premium",
      price: "59", 
      features: [
        "All Basic features",
        "Unlimited group classes",
        "1 personal training session/month",
        "Nutrition consultation"
      ]
    },
    {
      name: "Elite",
      price: "99",
      features: [
        "All Premium features",
        "4 personal training sessions/month",
        "Monthly body composition analysis",
        "Priority booking for classes"
      ]
    }
  ];

  return (
    <section id="pricing" className="py-20 px-8">
      <div className="container mx-auto">
        <Typography 
          variant="h2" 
          className="text-center mb-12 text-4xl font-bold text-white"
          data-aos="fade-down"
        >
          Membership Plans
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className="border border-gray-200 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#e2ff3d]/20 hover:border-[#e2ff3d]"
              data-aos="zoom-in"
              data-aos-delay={index * 100}
            >
              <CardBody className="text-center">
                <Typography variant="h5" className="mb-4 transition-colors duration-300 hover:text-[#e2ff3d]">
                  {plan.name}
                </Typography>
                <Typography variant="h1" className="mb-4">
                  ${plan.price}
                  <span className="text-lg">/month</span>
                </Typography>
                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2 transform transition-all duration-300 hover:translate-x-2">
                      <CheckIcon className="w-5 h-5 text-[#e2ff3d]" />
                      <Typography>{feature}</Typography>
                    </div>
                  ))}
                </div>
              </CardBody>
              <CardFooter className="flex justify-center">
                <Button 
                  className="bg-gradient-to-r from-[#e2ff3d] to-[#c8e235] text-black hover:shadow-lg hover:shadow-[#e2ff3d]/20 transform hover:scale-110 transition-all duration-300"
                >
                  Select Plan
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Pricing;
