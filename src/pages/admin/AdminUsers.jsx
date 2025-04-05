import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { toast, ToastContainer } from 'react-toastify';
import { HiSearch, HiUserAdd, HiTrash, HiPencil, HiRefresh, HiMail, HiPhone, HiUser } from 'react-icons/hi';
import 'react-toastify/dist/ReactToastify.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });

  // Filter users based on search query
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phoneNumber?.includes(searchQuery)
  );

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Please try again.");
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: ''
    });
    setEditingUser(null);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await api.post('/admin/users', {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password
      });
      
      toast.success("User added successfully");
      setUsers([...users, response.data.user]);
      setShowAddForm(false);
      resetForm();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to add user";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      // Only include password if it was changed
      const updateData = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber
      };
      
      if (formData.password) {
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords don't match");
          setIsSubmitting(false);
          return;
        }
        updateData.password = formData.password;
      }
      
      const response = await api.put(`/admin/users/${editingUser._id}`, updateData);
      
      toast.success("User updated successfully");
      
      // Update the users list with the updated user
      setUsers(users.map(user => 
        user._id === editingUser._id ? response.data.user : user
      ));
      
      setEditingUser(null);
      resetForm();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to update user";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    try {
      await api.delete(`/admin/user/${id}`);
      toast.success("User deleted successfully");
      setUsers(prevUsers => prevUsers.filter(u => u._id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Delete failed");
    }
  };

  const startEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      password: '',
      confirmPassword: ''
    });
    setShowAddForm(true);
  };

  // Loading state UI
  if (loading && !users.length) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-full">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <HiUser className="text-blue-600" /> 
              User Management
            </h1>
            <p className="text-gray-600 mt-1">Manage system users and their information</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                className="py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <HiSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            
            <button
              onClick={() => {resetForm(); setShowAddForm(!showAddForm)}}
              className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${
                showAddForm ? "bg-gray-200 text-gray-700" : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {showAddForm ? "Cancel" : <><HiUserAdd /> Add User</>}
            </button>
            
            <button
              onClick={fetchUsers}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
              disabled={loading}
            >
              <HiRefresh className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
            <button 
              onClick={fetchUsers}
              className="ml-3 underline"
            >
              Try Again
            </button>
          </div>
        )}
        
        {showAddForm && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {editingUser ? "Edit User" : "Add New User"}
            </h2>
            
            <form onSubmit={editingUser ? handleUpdateUser : handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <HiUser className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <HiMail className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <HiPhone className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="1234567890"
                    pattern="[0-9]{10}"
                    title="Phone number must be 10 digits"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingUser ? "New Password (leave blank to keep current)" : "Password"}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="••••••••"
                  minLength={6}
                  required={!editingUser}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="••••••••"
                  minLength={6}
                  required={!editingUser || formData.password !== ''}
                />
              </div>
              
              <div className="md:col-span-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowAddForm(false);
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Processing...
                    </span>
                  ) : (
                    editingUser ? "Update User" : "Add User"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {filteredUsers.length === 0 && !loading ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600 text-lg">No users found</p>
            {searchQuery && (
              <p className="text-gray-500 mt-2">
                Try adjusting your search or 
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-blue-600 underline ml-1"
                >
                  clear filters
                </button>
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th scope="col" className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-800 font-medium">{user.name?.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">ID: {user._id.substring(0,8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <HiMail className="text-gray-500" /> {user.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <HiPhone className="text-gray-500" /> {user.phoneNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => startEdit(user)}
                          className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-50"
                          title="Edit"
                        >
                          <HiPencil className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(user._id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                          title="Delete"
                        >
                          <HiTrash className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {users.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        )}
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default AdminUsers;
