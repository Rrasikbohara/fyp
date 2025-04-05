import React, { useState } from 'react';
import { api } from '../../services/api';
import { toast, ToastContainer } from 'react-toastify';

const AdminAddEquipment = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // POST to /admin/equipment/create endpoint
      await api.post('/admin/equipment/create', { name, description, imageUrl });
      toast.success('Equipment added successfully');
      setName('');
      setDescription('');
      setImageUrl('');
    } catch (error) {
      toast.error('Failed to add equipment');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Add Equipment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Equipment Name</label>
          <input
            type="text"
            value={name}
            onChange={(e)=>setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e)=>setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            rows="3"
            required
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Image URL</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e)=>setImageUrl(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
          Add Equipment
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default AdminAddEquipment;
