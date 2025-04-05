import React from 'react';
import { CheckCircleIcon, XCircleIcon, TrashIcon } from '@heroicons/react/24/outline';

const NutritionCard = ({ nutrition, onToggleComplete, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden p-4 flex flex-col md:flex-row justify-between items-center">
      <div className="w-full md:w-3/4">
        <div className="flex items-center mb-2">
          <span className="text-xl font-bold text-indigo-700">{nutrition.category}</span>
          {nutrition.completed && (
            <CheckCircleIcon className="h-6 w-6 text-green-500 ml-2" />
          )}
        </div>
        <p className="text-sm text-gray-500">Date: {new Date(nutrition.date).toLocaleDateString()}</p>
        <ul className="mt-4 border-t pt-2">
          {nutrition.items.map((item, idx) => (
            <li key={idx} className="flex justify-between text-sm py-1 border-b last:border-none">
              <span>{item.name} - {item.amount}</span>
              <span>{item.calories} kcal</span>
            </li>
          ))}
        </ul>
        {nutrition.completed && (
          <p className="mt-2 text-green-600 font-semibold">Completed</p>
        )}
      </div>
      <div className="flex flex-col gap-2 mt-4 md:mt-0">
        <button
          onClick={() => onToggleComplete(nutrition)}
          className="bg-blue-600 text-white px-3 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          {nutrition.completed ? 'Unmark' : 'Mark Complete'}
        </button>
        <button
          onClick={() => onDelete(nutrition._id)}
          className="bg-red-600 text-white px-3 py-2 rounded shadow hover:bg-red-700 transition"
        >
          <TrashIcon className="h-5 w-5 inline mr-1" /> Delete
        </button>
      </div>
    </div>
  );
};

export default NutritionCard;
