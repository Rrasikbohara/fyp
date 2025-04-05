import React from 'react';
import { Link } from 'react-router-dom';
import { HiStar, HiClock, HiCurrencyDollar, HiAcademicCap } from 'react-icons/hi';

const TrainerCard = ({ trainer }) => {
  // Get random image URL for trainer based on trainer ID
  const getTrainerImage = (id) => {
    // Use the trainer ID to generate a consistent but random-looking image
    const hash = id.substring(0, 8); // Use first few characters of ID
    return `https://randomuser.me/api/portraits/${parseInt(hash, 16) % 2 === 0 ? 'men' : 'women'}/${parseInt(hash, 16) % 70}.jpg`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* Trainer Image */}
      <div className="h-48 overflow-hidden">
        <img 
          src={getTrainerImage(trainer._id)} 
          alt={trainer.name} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      
      {/* Trainer Info */}
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-gray-800">{trainer.name}</h3>
          <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
            {trainer.rating > 0 ? (
              <div className="flex items-center gap-1">
                <HiStar className="text-yellow-500" />
                <span>{trainer.rating.toFixed(1)}</span>
              </div>
            ) : (
              <span>New</span>
            )}
          </div>
        </div>
        
        <div className="mt-2 text-sm text-gray-600 flex items-center gap-1">
          <HiAcademicCap />
          <span>{trainer.specialization}</span>
        </div>
        
        <div className="mt-2 flex items-center gap-1 text-sm text-gray-600">
          <HiClock />
          <span>{trainer.experience} years experience</span>
        </div>
        
        <div className="mt-2 text-lg font-bold text-blue-600 flex items-center">
          <HiCurrencyDollar />
          <span>{trainer.rate}</span>
          <span className="text-gray-500 text-sm font-normal">/hour</span>
        </div>
        
        <Link 
          to={`/dashboard/book-trainer?trainer=${trainer._id}`}
          className="mt-4 block w-full py-2 px-4 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
        >
          Book Session
        </Link>
      </div>
    </div>
  );
};

export default TrainerCard;
