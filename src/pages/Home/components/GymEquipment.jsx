
import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const GymEquipments = () => {
  useEffect(() => {
    AOS.init({
      duration: 1200,
      delay: 100,
      once: true,
    });
  }, []);

  const [equipments, setEquipments] = useState([]);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const fetchEquipments = async () => {
      const response = await fetch('https://picsum.photos/v2/list');
      const data = await response.json();
      const equipmentsData = data.map((item, index) => ({
        id: index + 1,
        name: `Equipment ${index + 1}`,
        description: `This is equipment ${index + 1}`,
        image: item.download_url,
      }));
      setEquipments(equipmentsData);
    };
    fetchEquipments();
  }, []);

  const handleShowMore = () => {
    setShowMore(!showMore);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 overflow-hidden">
      <h1
        className="text-5xl font-bold text-center mb-8"
        data-aos="fade-down"
        data-aos-duration="1500"
      >
        Gym Equipments
      </h1>
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
        data-aos="fade-up"
        data-aos-duration="1500"
      >
        {equipments.slice(0, showMore ? equipments.length : 3).map((equipment) => (
          <div
            key={equipment.id}
            data-aos="flip-left"
            data-aos-duration="1000"
            className="bg-white shadow-2xl rounded-lg p-6 text-center transform hover:scale-105 transition duration-500 ease-in-out"
          >
            <img
              src={equipment.image}
              alt={equipment.name}
              className="w-full h-64 object-cover mb-4"
              data-aos="zoom-in"
              data-aos-duration="800"
            />
            <h2
              className="text-3xl font-bold text-blue-500"
              data-aos="zoom-in"
              data-aos-duration="800"
            >
              {equipment.name}
            </h2>
            <p
              className="text-gray-700 mt-2"
              data-aos="fade-right"
              data-aos-duration="800"
            >
              {equipment.description}
            </p>
          </div>
        ))}
      </div>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleShowMore}
        data-aos="fade-up"
        data-aos-duration="1000"
      >
        {showMore ? 'Show Less' : 'Show More'}
      </button>
    </div>
  );
};

export default GymEquipments;