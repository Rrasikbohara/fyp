// Schedule.jsx
import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useOutletContext } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import alarmSound from "../../assets/alram.mp3";
import { api } from "../../services/api";

const Schedule = () => {
  const { scheduledWorkouts, setScheduledWorkouts } = useOutletContext();
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    day: "Sunday",
    time: "00:00",
    exercise: "Biceps",
    duration: 30
  });

  const alarmRef = useRef(new Audio(alarmSound));
  const checkInterval = useRef(null);
  const timerRef = useRef(null);

  // Alarm controls
  const stopAlarm = () => {
    alarmRef.current.pause();
    alarmRef.current.currentTime = 0;
    setIsAlarmPlaying(false);
  };

  // Timer controls
  const startTimer = () => {
    setIsTimerRunning(true);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsTimerRunning(false);
          alarmRef.current.play();
          setIsAlarmPlaying(true);
          toast.success("Workout completed successfully! 🎉", { 
            position: 'bottom-right',
            autoClose: 5000
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    clearInterval(timerRef.current);
    setIsTimerRunning(false);
  };

  const cancelWorkout = () => {
    clearInterval(timerRef.current);
    setIsTimerRunning(false);
    setTimer(0);
    setActiveWorkout(null);
    stopAlarm();
  };

  // Check scheduled times
  useEffect(() => {
    checkInterval.current = setInterval(() => {
      const now = new Date();
      const currentDay = now.toLocaleString('en-US', { weekday: 'long' });
      const currentTime = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit'
      });

      scheduledWorkouts.forEach(workout => {
        if (workout.day === currentDay && 
            workout.time === currentTime && 
            !workout.triggered) {
          alarmRef.current.play();
          setIsAlarmPlaying(true);
          setActiveWorkout(workout);
          setTimer(workout.duration * 60);
          toast.info(`Time for ${workout.exercise}!`, { 
            position: 'bottom-right',
            autoClose: false
          });
          setScheduledWorkouts(prev => prev.map(w => 
            w.id === workout.id ? {...w, triggered: true} : w
          ));
        }
      });
    }, 1000);

    return () => clearInterval(checkInterval.current);
  }, [scheduledWorkouts]);

  // Add new workout
  const addWorkoutSchedule = async () => {
    if (newWorkout.duration < 1) {
      toast.error("Duration must be at least 1 minute");
      return;
    }
    try {
      const res = await api.post("/api/schedule", newWorkout);
      setScheduledWorkouts(prev => [res.data, ...prev]);
      setNewWorkout({
        day: "Sunday",
        time: "00:00",
        exercise: "Biceps",
        duration: 30
      });
      toast.success("Workout scheduled successfully!");
    } catch (error) {
      console.error("Error adding schedule:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to add schedule");
    }
  };

  // Remove workout
  const removeWorkout = (id) => {
    setScheduledWorkouts(prev => prev.filter(w => w.id !== id));
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-10">
      {/* Header Section */}
      <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Workout Scheduler
        </h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="font-bold text-blue-600">
                {scheduledWorkouts.filter(w => !w.triggered).length}
              </span>
              <div className="absolute inset-0 border-2 border-blue-200 rounded-full animate-ping"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Day</label>
            <select
              value={newWorkout.day}
              onChange={e => setNewWorkout({...newWorkout, day: e.target.value})}
              className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
            >
              {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Time</label>
            <input
              type="time"
              value={newWorkout.time}
              onChange={e => setNewWorkout({...newWorkout, time: e.target.value})}
              className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Exercise</label>
            <select
              value={newWorkout.exercise}
              onChange={e => setNewWorkout({...newWorkout, exercise: e.target.value})}
              className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
            >
              {["Biceps","Triceps","Chest","Back","Shoulders","Legs","Cardio"].map(ex => (
                <option key={ex} value={ex}>{ex}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Duration (minutes)</label>
            <input
              type="number"
              min="1"
              value={newWorkout.duration}
              onChange={e => setNewWorkout({...newWorkout, duration: Math.max(1, e.target.valueAsNumber)})}
              className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button 
          onClick={addWorkoutSchedule}
          className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200"
        >
          Add Workout Schedule
        </button>
      </div>

      {/* Active Workout Section */}
      {activeWorkout && (
        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4 border-2 border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-blue-600">Active Workout</h3>
              <p className="text-gray-600">
                {activeWorkout.exercise} - {activeWorkout.duration} minutes
              </p>
            </div>
            <div className="flex space-x-2">
              {isAlarmPlaying && (
                <button
                  onClick={stopAlarm}
                  className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                  title="Mute alarm"
                >
                  🔕
                </button>
              )}
            </div>
          </div>

          <div className="text-center space-y-4">
            <div className="text-4xl font-mono font-bold text-blue-600">
              {formatTime(timer)}
            </div>
            <div className="flex justify-center space-x-3">
              {!isTimerRunning ? (
                <button
                  onClick={startTimer}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
                >
                  ▶ Start
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-all"
                >
                  ⏸ Pause
                </button>
              )}
              <button
                onClick={cancelWorkout}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all"
              >
                ⏹ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Workouts List */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Scheduled Workouts</h3>
        <div className="space-y-3">
          {scheduledWorkouts.map(workout => (
            <div key={workout.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-blue-600">{workout.day}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{workout.time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-sm">
                    {workout.exercise}
                  </span>
                  <span className="text-sm text-gray-500">
                    {workout.duration} minutes
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeWorkout(workout.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Schedule;