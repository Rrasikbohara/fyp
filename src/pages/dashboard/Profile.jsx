import React, { useState, useEffect } from "react";
import { api, getUserData } from "../../services/api";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  HiUser, HiMail, HiPhone, HiShieldCheck, 
  HiCalendar, HiPencil, HiKey, HiLogout,
  HiClipboardCheck, HiCreditCard, HiClock,
  HiStar, HiOutlineStar, HiCheck, HiX,
  HiExclamationCircle, HiCurrencyDollar
} from "react-icons/hi";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [trainerBookings, setTrainerBookings] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // For the review functionality
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 0,
    review: ""
  });
  
  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/auth/sign-in");
  };

  // Fetch user details and booking history
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get user data using our helper function
        const userDataResult = await getUserData();
        if (userDataResult) {
          setUserData(userDataResult);
          setPhoneNumber(userDataResult.phone || userDataResult.phoneNumber || "");
        } else if (user) {
          // Fallback to context user data
          setUserData(user);
          setPhoneNumber(user.phoneNumber || "");
        }
        
        // Get gym booking history
        const bookingsResponse = await api.get('/bookings/user');
        setBookings(bookingsResponse.data || []);
        
        // Get trainer booking history
        const trainerBookingsResponse = await api.get('/trainers/bookings');
        setTrainerBookings(trainerBookingsResponse.data || []);
        
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load your profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const updatePhoneNumber = async () => {
    if (!phoneNumber) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsUpdating(true);
    try {
      await api.put('/user/update-phone', { phone: phoneNumber });
      toast.success("Phone number updated successfully");
      setIsEditing(false);
      
      // Update user data in state
      if (userData) {
        setUserData({
          ...userData,
          phone: phoneNumber,
          phoneNumber: phoneNumber
        });
      }
    } catch (error) {
      console.error("Error updating phone number:", error);
      toast.error("Failed to update phone number");
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    
    // Validate password inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    setIsUpdating(true);
    try {
      const response = await api.put('/user/change-password', { 
        currentPassword, 
        newPassword 
      });
      
      if (response.status === 200) {
        toast.success("Password changed successfully");
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      }
    } catch (error) {
      console.error("Change password error:", error);
      const errorMsg = error.response?.data?.message || "Failed to change password";
      toast.error(errorMsg);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleReviewSubmit = async () => {
    if (!selectedBooking) return;
    if (reviewData.rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    
    try {
      setIsUpdating(true);
      
      // Submit the review
      await api.post('/feedback', {
        trainerId: selectedBooking.trainer._id,
        rating: reviewData.rating,
        review: reviewData.review,
        bookingId: selectedBooking._id
      });
      
      // Update the booking to mark as reviewed
      await api.patch(`/trainers/bookings/${selectedBooking._id}/reviewed`, {
        reviewed: true
      });
      
      // Update local state to reflect the review
      setTrainerBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === selectedBooking._id ? { ...booking, reviewed: true } : booking
        )
      );
      
      toast.success("Review submitted successfully");
      setShowReviewModal(false);
      setSelectedBooking(null);
      setReviewData({ rating: 0, review: "" });
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setIsUpdating(false);
    }
  };
  
  const openReviewModal = (booking) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge style based on booking status
  const getStatusBadgeClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmed':
        return "bg-green-100 text-green-800";
      case 'pending':
        return "bg-yellow-100 text-yellow-800";
      case 'cancelled':
        return "bg-red-100 text-red-800";
      case 'completed':
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <ToastContainer position="bottom-right" />
      
      {/* Profile header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-lg">
        <div className="flex items-center gap-4">
          <div className="bg-white p-2 rounded-full">
            <HiUser className="h-16 w-16 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{userData?.username || userData?.name || user?.name || "Loading..."}</h1>
            <p className="opacity-80">Your personal account</p>
          </div>
        </div>
      </div>
      
      {/* Tab navigation */}
      <div className="bg-white border-b">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab("personal")}
            className={`px-6 py-3 font-medium ${
              activeTab === "personal" 
                ? "border-b-2 border-blue-600 text-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <HiUser className="inline mr-1" />
            Personal Info
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-6 py-3 font-medium ${
              activeTab === "bookings" 
                ? "border-b-2 border-blue-600 text-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <HiCalendar className="inline mr-1" />
            My Bookings
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`px-6 py-3 font-medium ${
              activeTab === "security" 
                ? "border-b-2 border-blue-600 text-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <HiShieldCheck className="inline mr-1" />
            Security
          </button>
        </div>
      </div>
      
      {/* Profile content */}
      <div className="bg-white shadow-md rounded-b-lg">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="p-6">
            {/* Personal Information Tab */}
            {activeTab === "personal" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
                  <button 
                    onClick={() => setIsEditing(!isEditing)} 
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <HiPencil /> 
                    {isEditing ? "Cancel" : "Edit"}
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Full Name</label>
                    <div className="flex items-center gap-2">
                      <HiUser className="text-gray-500" />
                      <span className="font-medium">{userData?.name || userData?.username || "Not available"}</span>
                    </div>
                  </div>
                  
                  {/* Email */}
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Email Address</label>
                    <div className="flex items-center gap-2">
                      <HiMail className="text-gray-500" />
                      <span className="font-medium">{userData?.email || "Not available"}</span>
                    </div>
                  </div>
                  
                  {/* Phone */}
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Phone Number</label>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <input 
                          type="tel" 
                          value={phoneNumber} 
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="border rounded-lg px-3 py-2 w-full"
                          pattern="[0-9]{10}"
                          title="Please enter a valid 10-digit phone number"
                        />
                        <button 
                          onClick={updatePhoneNumber}
                          disabled={isUpdating}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                        >
                          {isUpdating ? (
                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                          ) : (
                            "Save"
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <HiPhone className="text-gray-500" />
                        <span className="font-medium">{userData?.phone || userData?.phoneNumber || "Not available"}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Join Date */}
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Member Since</label>
                    <div className="flex items-center gap-2">
                      <HiCalendar className="text-gray-500" />
                      <span className="font-medium">
                        {userData?.createdAt ? formatDate(userData.createdAt) : "Not available"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Bookings Tab */}
            {activeTab === "bookings" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">My Bookings</h2>
                
                {/* Gym Bookings */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
                    <HiCalendar className="mr-2 text-blue-600" />
                    Gym Sessions
                  </h3>
                  
                  {bookings.length === 0 ? (
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-gray-600">You don't have any gym bookings yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Workout</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {bookings.map((booking) => (
                            <tr key={booking._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {booking.workoutType}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(booking.bookingDate)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {booking.startTime} - {booking.endTime}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ₹{booking.payment?.amount || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(booking.status)}`}>
                                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                
                {/* Trainer Bookings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
                    <HiUser className="mr-2 text-purple-600" />
                    Trainer Sessions
                  </h3>
                  
                  {trainerBookings.length === 0 ? (
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-gray-600">You don't have any trainer bookings yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trainer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {trainerBookings.map((booking) => (
                            <tr key={booking._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                    <HiUser className="h-4 w-4 text-purple-600" />
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">{booking.trainer?.name || "Trainer"}</div>
                                    <div className="text-xs text-gray-500">{booking.trainer?.specialization || ""}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(booking.sessionDate)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {booking.time || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ₹{booking.amount || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(booking.status)}`}>
                                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {booking.status === 'completed' && !booking.reviewed ? (
                                  <button
                                    onClick={() => openReviewModal(booking)}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    <HiStar className="h-5 w-5" />
                                  </button>
                                ) : booking.reviewed ? (
                                  <span className="text-green-600 flex items-center justify-end">
                                    <HiCheck className="h-4 w-4 mr-1" /> Reviewed
                                  </span>
                                ) : null}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Security Tab */}
            {activeTab === "security" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Security Settings</h2>
                
                {/* Password Change Section */}
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
                    <HiKey className="mr-2 text-blue-600" /> 
                    Password
                  </h3>
                  <p className="text-gray-600 mb-4">
                    It's a good idea to use a strong password that you don't use elsewhere
                  </p>
                  
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Change Password
                  </button>
                </div>
                
                {/* Account Actions */}
                <>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Account Actions</h3>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => navigate('/dashboard/change-password')}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                      >
                        Change Password
                      </button>
                      <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                  
                  {showDeleteConfirm && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h3 className="text-lg font-semibold text-red-700 mb-2">Delete Account</h3>
                      <p className="text-red-600 mb-3">
                        This action cannot be undone. All your data will be permanently removed.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleDeleteAccount()}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          Confirm Delete
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Password change modal */}
      {isChangingPassword && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center"></div>
          <div className="bg-white rounded-lg w-full max-w-md mx-4 p-6">
            <h3 className="text-xl font-semibold mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1 text-sm">Current Password</label>
                <input 
                  type="password" 
                  value={passwordData.currentPassword} 
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 text-sm">New Password</label>
                <input 
                  type="password"
                  value={passwordData.newPassword} 
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 text-sm">Confirm New Password</label>
                <input 
                  type="password"
                  value={passwordData.confirmPassword} 
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button 
                onClick={() => setIsChangingPassword(false)}
                className="px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50"
              ></button>
                Cancel
              </button>
              <button 
                onClick={handleChangePassword}
                disabled={isUpdating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                {isUpdating ? (
                  <div className="flex items-center gap-2"></div>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Review modal */}
      {showReviewModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 p-6">
            <h3 className="text-xl font-semibold mb-2">
              Rate Your Session with {selectedBooking.trainer?.name}
            </h3>
            <p className="text-gray-600 mb-4">
              Session Date: {formatDate(selectedBooking.sessionDate)}
            </p>
            
            <div className="mb-4"></div>
              <label className="block text-gray-700 mb-2">Your Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewData({...reviewData, rating: star})}
                    className="focus:outline-none"
                  >
                    {star <= reviewData.rating ? (
                      <HiStar className="h-8 w-8 text-yellow-500" />
                    ) : (
                      <HiOutlineStar className="h-8 w-8 text-gray-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4"></div>
              <label className="block text-gray-700 mb-2">Your Review (Optional)</label>
              <textarea
                value={reviewData.review}
                onChange={(e) => setReviewData({...reviewData, review: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 resize-none"
                rows="4"
                placeholder="Share your experience with this trainer..."
              ></textarea>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button 
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleReviewSubmit}
                disabled={isUpdating || reviewData.rating === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                {isUpdating ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;