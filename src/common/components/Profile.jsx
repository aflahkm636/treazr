import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../common/context/AuthProvider";
import axios from "axios";
import { FaUser, FaHeart, FaBoxOpen, FaEdit } from "react-icons/fa";

const Profile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      
      try {
        const response = await axios.get(`http://localhost:3000/users/${user.id}`);
        setUser(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user?.id]);

  if (loading) return <div className="text-center py-10">Loading profile...</div>;
  if (!user) return <div className="text-center py-10 text-red-500">Please login to view profile</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 mt-10">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 rounded-full p-3">
              <FaUser className="text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-indigo-100">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          {/* User Details */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaUser className="mr-2 text-indigo-600" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              {/* <div>
                <p className="text-gray-600">Phone</p>
                <p className="font-medium">{user.phone || "Not provided"}</p>
              </div> */}
              <div>
                <p className="text-gray-600">Member Since</p>
                <p className="font-medium">
                  {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 ">
            <button
              onClick={() => navigate("/wishlist")}
              className="flex items-center justify-center space-x-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-3 rounded-lg transition-colors"
            >
              <FaHeart className="text-indigo-600" />
              <span>View Wishlist</span>
            </button>
            <button
              onClick={() => navigate("/vieworder")}
              className="flex items-center justify-center space-x-2 bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-3 rounded-lg transition-colors"
            >
              <FaBoxOpen className="text-purple-600" />
              <span>View Orders</span>
            </button>
          </div>

          {/* Recent Orders Preview */}
          {user.orders?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaBoxOpen className="mr-2 text-indigo-600" />
                Recent Orders
              </h2>
              <div className="space-y-4">
                {user.orders.slice(0, 3).map((order) => (
                  <div 
                    key={order.id} 
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/orderstatus/${order.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'delivered' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <p className="text-sm">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                      <p className="font-medium">${order.total}</p>
                    </div>
                  </div>
                ))}
              </div>
              {user.orders.length > 3 && (
                <button
                  onClick={() => navigate("/vieworder")}
                  className="mt-4 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  View all orders ({user.orders.length})
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;