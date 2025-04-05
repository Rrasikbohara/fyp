import React, { useState } from 'react';
import { api } from '../../services/api';
import { toast, ToastContainer } from 'react-toastify';

const AdminAddTrainer = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('');
  const [rate, setRate] = useState('');
  const [availability, setAvailability] = useState('');
  const [bio, setBio] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // POST to /admin/trainer/create endpoint
      await api.post('/admin/trainer/create', {
        name,
        email,
        specialization,
        experience,
        rate,
        availability,
        bio
      });
      toast.success('Trainer added successfully');
      setName(''); setEmail(''); setSpecialization(''); setExperience('');
      setRate(''); setAvailability(''); setBio('');
    } catch (error) {
      toast.error('Error adding trainer');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Add New Trainer</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Specialization</label>
          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="" disabled>Select specialization</option>
            <option value="Biceps">Biceps</option>
            <option value="Shoulders">Shoulders</option>
            <option value="Legs">Legs</option>
            <option value="Abs">Abs</option>
            <option value="Fat Loss">Fat Loss</option>
            <option value="Cardio">Cardio</option>
            <option value="Weight Training">Weight Training</option>
            <option value="Yoga">Yoga</option>
            <option value="CrossFit">CrossFit</option>
            <option value="Nutrition">Nutrition</option>
            <option value="Zumba">Zumba</option>
            <option value="HIIT">HIIT</option>
            <option value="Pilates">Pilates</option>
            <option value="Strength Training">Strength Training</option>
            <option value="Bodybuilding">Bodybuilding</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Experience (years)</label>
          <input type="number" value={experience} onChange={(e) => setExperience(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Rate ($/hr)</label>
          <input type="number" value={rate} onChange={(e) => setRate(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Availability</label>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="" disabled>Select availability</option>
            <option value="available">Available</option>
            <option value="booked">Booked</option>
            <option value="not available">Not Available</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows="3" />
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700">
          Add Trainer
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default AdminAddTrainer;
