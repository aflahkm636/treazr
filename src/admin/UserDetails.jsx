// components/UserDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

const UserDetails = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/users/${userId}`);
        setUser(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user:', error);
        toast.error('Failed to load user details');
        setLoading(false);
        navigate('/admin/manage-users');
      }
    };

    fetchUser();
  }, [userId, navigate]);

  const toggleUserStatus = async () => {
    try {
      const result = await Swal.fire({
        title: 'Confirm Status Change',
        text: `Are you sure you want to ${user.isBlock ? 'unblock' : 'block'} this user?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: `Yes, ${user.isBlock ? 'Unblock' : 'Block'}`
      });

      if (result.isConfirmed) {
        const updatedUser = { ...user, isBlock: !user.isBlock };
        await axios.patch(`http://localhost:3000/users/${userId}`, {
          isBlock: updatedUser.isBlock
        });

        setUser(updatedUser);
        toast.success(`User ${updatedUser.isBlock ? 'blocked' : 'unblocked'} successfully`);
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async () => {
    try {
      const result = await Swal.fire({
        title: 'Delete User',
        text: 'Are you sure you want to delete this user? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        await axios.delete(`http://localhost:3000/users/${userId}`);
        toast.success('User deleted successfully');
        navigate('/admin/manage-users');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const calculateOrderStats = () => {
    if (!user?.orders?.length) return null;
    
    const stats = {
      totalOrders: user.orders.length,
      totalSpent: user.orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0).toFixed(2),
      statusCounts: {
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        completed: 0
      }
    };

    user.orders.forEach(order => {
      if (order.status && stats.statusCounts[order.status.toLowerCase()] !== undefined) {
        stats.statusCounts[order.status.toLowerCase()]++;
      }
    });

    return stats;
  };

  const orderStats = calculateOrderStats();

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading user details...</div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center h-64">User not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/admin/manage-users')}
        className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Users
      </button>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">User Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and account information</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={toggleUserStatus}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                ${user.isBlock ? 'bg-red-500' : 'bg-green-500'}`}
            >
              <span
                className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full 
                  ${user.isBlock ? 'translate-x-6' : 'translate-x-1'}`}
              />
              <span className="sr-only">{user.isBlock ? 'Blocked' : 'Active'}</span>
            </button>
            <button
              onClick={handleDeleteUser}
              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
            >
              Delete User
            </button>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.name}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">User ID</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.id}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                  {user.role}
                </span>
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Account Status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user.isBlock ? (
                  <span className="text-red-600">Blocked</span>
                ) : (
                  <span className="text-green-600">Active</span>
                )}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Registration Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(user.created_at).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {orderStats && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Order Statistics</h3>
          </div>
          <div className="border-t border-gray-200">
            <dl className="divide-y divide-gray-200">
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Total Orders</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{orderStats.totalOrders}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Total Amount Spent</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">${orderStats.totalSpent}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Order Status Breakdown</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Processing:</span> {orderStats.statusCounts.processing}
                    </div>
                    <div>
                      <span className="font-medium">Shipped:</span> {orderStats.statusCounts.shipped}
                    </div>
                    <div>
                      <span className="font-medium">Delivered:</span> {orderStats.statusCounts.delivered}
                    </div>
                    <div>
                      <span className="font-medium">Completed:</span> {orderStats.statusCounts.completed}
                    </div>
                    <div>
                      <span className="font-medium">Cancelled:</span> {orderStats.statusCounts.cancelled}
                    </div>
                  </div>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Order History</h3>
        </div>
        {user.orders && user.orders.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {user.orders.map((order) => (
              <div key={order.id} className="px-4 py-5 sm:px-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-md font-medium text-gray-900">Order #{order.id}</h4>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(order.date || order.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Status: 
                      <span className={`ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'delivered' || order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">Total: ${order.total}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-700">Items:</h5>
                  <ul className="mt-2 space-y-2">
                    {order.items.map((item, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {item.quantity} x {item.name} (${item.price} each)
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-5 sm:px-6">
            <p className="text-sm text-gray-500">No orders found for this user.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;