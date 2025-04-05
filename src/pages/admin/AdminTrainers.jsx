import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { toast, ToastContainer } from 'react-toastify';

const AdminTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialization: '',
    experience: '',
    rate: '',
    availability: '',
    bio: ''
  });

  const fetchTrainers = async () => {
    try {
      const res = await api.get('/admin/trainers');
      setTrainers(res.data);
    } catch (error) {
      toast.error("Failed to load trainers");
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      specialization: '',
      experience: '',
      rate: '',
      availability: '',
      bio: ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this trainer?")) return;
    try {
      await api.delete(`/admin/trainer/${id}`);
      toast.success("Trainer deleted");
      setTrainers(prev => prev.filter(t => t._id !== id));
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleAddTrainer = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/trainer/create', formData);
      toast.success('Trainer added successfully');
      resetForm();
      setShowAddForm(false);
      fetchTrainers();
    } catch (error) {
      toast.error('Error adding trainer: ' + error.message);
    }
  };

  const handleEditTrainer = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/trainer/${editingTrainer._id}`, formData);
      toast.success('Trainer updated successfully');
      setEditingTrainer(null);
      resetForm();
      fetchTrainers();
    } catch (error) {
      toast.error('Error updating trainer: ' + error.message);
    }
  };

  const startEdit = (trainer) => {
    setEditingTrainer(trainer);
    setFormData({
      name: trainer.name,
      email: trainer.email,
      specialization: trainer.specialization,
      experience: trainer.experience,
      rate: trainer.rate,
      availability: trainer.availability,
      bio: trainer.bio
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Trainers</h1>
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => { setShowAddForm(!showAddForm); setEditingTrainer(null); resetForm(); }}
          className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700"
        >
          {showAddForm ? 'Cancel' : 'Add Trainer'}
        </button>
      </div>
      
      { (showAddForm || editingTrainer) && (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg mb-6">
          <h2 className="text-2xl font-bold mb-4">{editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}</h2>
          <form onSubmit={editingTrainer ? handleEditTrainer : handleAddTrainer} className="space-y-4">
            {/* Input fields */}
            {['name', 'email', 'experience', 'rate'].map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 capitalize">{field}</label>
                <input
                  type={field === 'email' ? 'email' : (field === 'experience' || field === 'rate' ? 'number' : 'text')}
                  value={formData[field]}
                  onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            ))}
            {/* Replace free-text specialization field with a select */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Specialization</label>
              <select
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
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
            {/* Replace free-text availability field with a select */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Availability</label>
              <select
                value={formData.availability}
                onChange={(e) => setFormData({...formData, availability: e.target.value})}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="" disabled>Select availability</option>
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="not available">Not Available</option>
              </select>
            </div>
            {/* Continue with the bio field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="3"
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700">
              {editingTrainer ? 'Update Trainer' : 'Add Trainer'}
            </button>
          </form>
        </div>
      )}
      
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full bg-white rounded shadow text-sm">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Specialization</th>
              <th className="px-4 py-3 text-left">Status</th>  {/* new column */}
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trainers.map(t => (
              <tr key={t._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{t._id.substring(0,6)}</td>
                <td className="px-4 py-3">{t.name}</td>
                <td className="px-4 py-3">{t.email}</td>
                <td className="px-4 py-3">{t.specialization}</td>
                <td className="px-4 py-3">
                  <select
                    value={t.availability}
                    onChange={async (e) => {
                      const newStatus = e.target.value;
                      try {
                        await api.put(`/admin/trainer/${t._id}`, { availability: newStatus });
                        toast.success('Status updated');
                        setTrainers(prev => prev.map(tr => tr._id === t._id ? { ...tr, availability: newStatus } : tr));
                      } catch (err) {
                        toast.error('Failed to update status');
                      }
                    }}
                    className="p-2 border rounded"
                  >
                    <option value="available">Available</option>
                    <option value="booked">Booked</option>
                    <option value="not available">Not Available</option>
                  </select>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => startEdit(t)} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(t._id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {trainers.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-3">No trainers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AdminTrainers;
