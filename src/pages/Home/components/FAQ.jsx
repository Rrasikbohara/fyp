import React from 'react';
import { Typography, Accordion, AccordionHeader, AccordionBody } from "@material-tailwind/react";
import AOS from 'aos';
import 'aos/dist/aos.css';

export function FAQ() {
  const [open, setOpen] = React.useState(1);
  
  React.useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });
  }, []);

  const handleOpen = (value) => setOpen(open === value ? 0 : value);

  const faqs = [
    {
      question: "What are your operating hours?",
      answer: "Our gym is open 24/7, allowing members to work out at their convenience. Staff hours are from 6 AM to 10 PM daily."
    },
    {
      question: "Do you offer personal training?", 
      answer: "Yes, we have certified personal trainers available. You can book one-on-one sessions or join group training sessions."
    },
    {
      question: "Can I freeze my membership?",
      answer: "Yes, members can freeze their membership for up to 3 months per year with a valid reason."
    },
    {
      question: "What's included in the membership?",
      answer: "Membership includes access to all gym equipment, locker rooms, and basic group classes. Premium features vary by plan."
    }
  ];

  return (
    <section id="faq" className="py-20 px-8 bg-gray-100">
      <div className="container mx-auto">
        <Typography 
          variant="h2" 
          className="text-center mb-12 text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#c8e235] to-[#9eb82a] hover:scale-105 transition-all duration-300"
          data-aos="fade-down"
        >
          Frequently Asked Questions
        </Typography>
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              data-aos="zoom-in"
              data-aos-delay={index * 100}
              className="mb-4 transform hover:scale-[1.02] transition-all duration-300"
            >
              <Accordion 
                open={open === index + 1}
                className="border border-transparent hover:border-[#e2ff3d] rounded-lg hover:shadow-lg hover:shadow-[#e2ff3d]/20 bg-white transition-all duration-500 overflow-hidden"
              >
                <AccordionHeader 
                  onClick={() => handleOpen(index + 1)}
                  className={`hover:text-[#c8e235] transition-all duration-300 px-4 py-3 flex items-center justify-between ${open === index + 1 ? 'text-[#c8e235]' : ''}`}
                >
                  <span className="transform hover:translate-x-2 transition-all duration-300">
                    {faq.question}
                  </span>
                  <span className={`transform transition-transform duration-300 ${open === index + 1 ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </AccordionHeader>
                <AccordionBody className={`text-gray-700 px-4 transition-all duration-500 ease-in-out transform origin-top ${open === index + 1 ? 'opacity-100 scale-y-100 py-3' : 'opacity-0 scale-y-0 h-0 py-0'}`}>
                  <div className="transform hover:translate-x-2 transition-all duration-300">
                    {faq.answer}
                  </div>
                </AccordionBody>
              </Accordion>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
