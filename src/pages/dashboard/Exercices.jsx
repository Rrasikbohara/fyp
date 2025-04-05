import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { HiTrash, HiPlay, HiSearch } from 'react-icons/hi';
import 'react-toastify/dist/ReactToastify.css';
import 'tailwindcss/tailwind.css';
import alarmSound from '../../assets/alram.mp3';

// Exercise database with photos and instructions
const exercisesDatabase = [
  {
    id: 1,
    name: 'Push Ups',
    category: 'Strength',
    image: 'https://hips.hearstapps.com/hmg-prod/images/push-ups-royalty-free-image-1570737420.jpg',
    instructions: '1. Begin in plank position with hands shoulder-width apart.\n2. Keep your body in a straight line from head to toe.\n3. Lower your body until your chest nearly touches the floor.\n4. Push yourself back up to the starting position.\n5. Repeat for desired reps.'
  },
  {
    id: 2,
    name: 'Squats',
    category: 'Lower Body',
    image: 'https://hips.hearstapps.com/hmg-prod/images/legs-squat-royalty-free-image-1603903644.jpg',
    instructions: '1. Stand with feet shoulder-width apart.\n2. Extend arms in front for balance.\n3. Bend knees and push hips back as if sitting in a chair.\n4. Keep chest up and back straight.\n5. Lower until thighs are parallel to ground, then return to start position.'
  },
  {
    id: 3,
    name: 'Lunges',
    category: 'Lower Body',
    image: 'https://hips.hearstapps.com/hmg-prod/images/lunge-royalty-free-image-1590508581.jpg',
    instructions: '1. Stand with feet hip-width apart.\n2. Step forward with one leg.\n3. Lower your body until both knees form 90-degree angles.\n4. Push through front foot to return to starting position.\n5. Repeat with other leg.'
  },
  {
    id: 4,
    name: 'Plank',
    category: 'Core',
    image: 'https://hips.hearstapps.com/hmg-prod/images/plank-position-royalty-free-image-1591090973.jpg',
    instructions: '1. Start in push-up position but with forearms on the ground.\n2. Keep elbows directly under shoulders.\n3. Maintain a straight line from head to heels.\n4. Engage core and hold the position.\n5. Breathe normally and hold for desired time.'
  },
  {
    id: 5,
    name: 'Crunches',
    category: 'Core',
    image: 'https://hips.hearstapps.com/hmg-prod/images/crunches-royalty-free-image-1581357476.jpg',
    instructions: '1. Lie on your back with knees bent.\n2. Place hands behind head or across chest.\n3. Lift shoulders off the ground using abdominal muscles.\n4. Keep lower back pressed into the floor.\n5. Slowly return to starting position and repeat.'
  }
];

const Exercices = () => {
  const [exercise, setExercise] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [timer, setTimer] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [running, setRunning] = useState(false);
  const [exerciseHistory, setExerciseHistory] = useState([]);
  const [direction, setDirection] = useState(''); // Custom instructions
  
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const storedHistory = localStorage.getItem('exerciseHistory');
    if (storedHistory) {
      setExerciseHistory(JSON.parse(storedHistory));
    }
  }, []);

  // Persist history changes
  useEffect(() => {
    localStorage.setItem('exerciseHistory', JSON.stringify(exerciseHistory));
  }, [exerciseHistory]);

  // Handle search for exercises
  useEffect(() => {
    if (searchQuery) {
      const filteredExercises = exercisesDatabase.filter(ex => 
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredExercises);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const selectExerciseFromDatabase = (exerciseItem) => {
    setExercise(exerciseItem.name);
    setDirection(exerciseItem.instructions);
    setSelectedExercise(exerciseItem);
    setSearchQuery('');
    setSearchResults([]);
  };

  const startTimer = (duration) => {
    setCurrentDuration(duration);
    setTimer(duration);
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          if (audioRef.current) {
            audioRef.current.play();
            setTimeout(() => {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }, 3000);
          }
          toast.success("Exercise complete!");
          
          const historyEntry = {
            id: Date.now(),
            name: exercise,
            duration: duration,
            direction: direction
          };
          
          // If selected from database, add image too
          if (selectedExercise && selectedExercise.image) {
            historyEntry.image = selectedExercise.image;
          }
          
          setExerciseHistory(prev => [...prev, historyEntry]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
  };

  const runExercise = (record) => {
    setExercise(record.name);
    setDirection(record.direction || '');
    if (record.image) {
      setSelectedExercise({ ...record });
    } else {
      setSelectedExercise(null);
    }
    startTimer(record.duration);
  };

  const deleteExercise = (id) => {
    setExerciseHistory(prev => prev.filter(record => record.id !== id));
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white p-8">
      <ToastContainer />
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-5xl font-bold text-center text-blue-900">Exercise Dashboard</h1>
        
        <div className="bg-white shadow-lg rounded-xl p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-xl font-medium text-gray-700 mb-3">
                Enter Exercise Name or Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for exercises..."
                  className="w-full p-3 border rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <HiSearch className="absolute top-3.5 left-3 text-gray-400 text-lg" />
              </div>
            </div>
            
            {!selectedExercise && (
              <div className="flex-1">
                <label className="block text-xl font-medium text-gray-700 mb-3">
                  Or enter custom exercise
                </label>
                <input
                  type="text"
                  value={exercise}
                  onChange={(e) => setExercise(e.target.value)}
                  placeholder="e.g., Push Ups"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            )}
          </div>
          
          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="mt-4 border rounded-lg max-h-60 overflow-y-auto">
              <ul className="divide-y">
                {searchResults.map((ex) => (
                  <li 
                    key={ex.id} 
                    className="p-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3"
                    onClick={() => selectExerciseFromDatabase(ex)}
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                      {ex.image && <img src={ex.image} alt={ex.name} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <div className="font-medium">{ex.name}</div>
                      <div className="text-sm text-gray-600">{ex.category}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {exercise && !selectedExercise && (
            <div className="mt-4">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Add Your Exercise Directions (optional)
              </label>
              <textarea
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                placeholder="e.g., Keep your back straight and lower slowly..."
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows="3"
              />
            </div>
          )}
        </div>
        
        {(exercise || selectedExercise) && (
          <div className="bg-white shadow-xl rounded-xl p-6">
            <div className="mb-6 border-b pb-4 flex flex-col md:flex-row justify-between items-center">
              <div>
                <h2 className="text-3xl font-semibold text-gray-800">{exercise}</h2>
                <p className="text-gray-500">Focus & maintain proper form during your exercise.</p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center gap-4">
                <label className="text-lg font-medium text-gray-700">Duration (sec):</label>
                <input
                  type="number"
                  value={timer}
                  onChange={(e) => setTimer(Number(e.target.value))}
                  className="w-28 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={running}
                />
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              {/* Exercise image */}
              <div className="md:w-1/2">
                <div className="relative pb-[80%] rounded-lg overflow-hidden shadow-md bg-gray-200">
                  {selectedExercise && selectedExercise.image ? (
                    <img 
                      src={selectedExercise.image} 
                      alt={selectedExercise.name}
                      className="absolute top-0 left-0 w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                      <p className="text-xl text-gray-600 p-4 text-center">No image available for this exercise</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Exercise Instructions */}
              <div className="md:w-1/2">
                <h3 className="text-xl font-semibold mb-3">Instructions</h3>
                <div className="bg-gray-50 p-4 rounded-lg shadow-inner h-full">
                  {direction ? (
                    <div className="whitespace-pre-line">{direction}</div>
                  ) : (
                    <p className="text-gray-500 italic">No instructions provided for this exercise.</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => startTimer(timer)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  disabled={running || timer <= 0}
                >
                  {running ? 'Running...' : 'Start Timer'}
                </button>
                <button 
                  onClick={stopTimer}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  disabled={!running}
                >
                  Stop Timer
                </button>
              </div>
              {running && (
                <div className="text-2xl font-bold text-blue-600">
                  Time Remaining: {timer} sec
                </div>
              )}
            </div>
          </div>
        )}
        
        {exerciseHistory.length > 0 && (
          <div className="bg-white shadow-xl rounded-xl p-6">
            <h3 className="text-3xl font-semibold text-gray-800 mb-4">Previous Exercises</h3>
            <ul className="space-y-4">
              {exerciseHistory.map(record => (
                <li key={record.id} className="border rounded-lg overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {/* If the exercise has an image, show it */}
                    {record.image && (
                      <div className="md:w-1/4">
                        <div className="relative pb-[75%] md:pb-0 md:h-full">
                          <img 
                            src={record.image} 
                            alt={record.name}
                            className="absolute top-0 left-0 w-full h-full object-cover" 
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Exercise details */}
                    <div className={`p-4 ${record.image ? 'md:w-3/4' : 'w-full'}`}>
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                        <div>
                          <div className="text-xl font-medium text-gray-700">{record.name}</div>
                          <div className="text-gray-500">Duration: {record.duration} sec</div>
                          {record.direction && (
                            <div className="mt-2 text-gray-600 line-clamp-2 text-sm">
                              <span className="font-medium">Instructions:</span> {record.direction}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-3 md:mt-0">
                          <button 
                            onClick={() => runExercise(record)} 
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50"
                          >
                            <HiPlay className="w-6 h-6" />
                          </button>
                          <button 
                            onClick={() => deleteExercise(record.id)} 
                            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50"
                          >
                            <HiTrash className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <audio ref={audioRef} src={alarmSound} preload="auto" />
      </div>
    </div>
  );
};

export default Exercices;
