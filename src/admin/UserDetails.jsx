// components/UserDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiUser, FiUserX, FiUserCheck, FiTrash2, FiChevronDown, FiChevronUp, FiBox, FiDollarSign, FiCalendar } from 'react-icons/fi';

const UserDetails = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${URL}/users/${userId}`);
        setUser(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user:', error);
        toast.error('Failed to load user details');
        setLoading(false);
        navigate('/admin/users');
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
        await axios.patch(`${URL}/users/${userId}`, {
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
        await axios.delete(`${URL}/users/${userId}`);
        toast.success('User deleted successfully');
        navigate('/admin/sers');
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

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const orderStats = calculateOrderStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <FiUserX className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-lg font-medium text-gray-900">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/admin/users')}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
      >
        <FiArrowLeft className="mr-2" /> Back to Users
      </button>

      {/* User Information Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 border border-gray-100">
        <div className="p-6 sm:px-8 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={toggleUserStatus}
                className={`px-4 py-2 rounded-lg font-medium flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${user.isBlock 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500' 
                    : 'bg-red-100 text-red-800 hover:bg-red-200 focus:ring-red-500'
                  }`}
              >
                {user.isBlock ? (
                  <>
                    <FiUserCheck className="mr-2" /> Unblock User
                  </>
                ) : (
                  <>
                    <FiUserX className="mr-2" /> Block User
                  </>
                )}
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium flex items-center hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <FiTrash2 className="mr-2" /> Delete User
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                  <FiUser className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <p className={`mt-1 text-sm font-semibold 
                    ${user.role === 'admin' ? 'text-purple-800' : 'text-green-800'}`}>
                    {user.role === 'admin' ? 'Administrator' : 'Standard User'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                  <FiCalendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Joined</p>
                  <p className="mt-1 text-sm font-semibold text-gray-800">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                  {user.isBlock ? (
                    <FiUserX className="h-5 w-5" />
                  ) : (
                    <FiUserCheck className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className={`mt-1 text-sm font-semibold ${user.isBlock ? 'text-red-600' : 'text-green-600'}`}>
                    {user.isBlock ? 'Blocked' : 'Active'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Statistics */}
      {orderStats && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 border border-gray-100">
          <div className="p-6 sm:px-8 sm:py-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Order Statistics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-5 rounded-lg">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                    <FiBox className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="mt-1 text-2xl font-bold text-gray-800">{orderStats.totalOrders}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-5 rounded-lg">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                    <FiDollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="mt-1 text-2xl font-bold text-gray-800">${orderStats.totalSpent}</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-5 rounded-lg">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Order Status</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {Object.entries(orderStats.statusCounts).map(([status, count]) => (
                        count > 0 && (
                          <span key={status} className={`px-2 py-1 text-xs font-medium rounded-full
                            ${
                              status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                              status === 'delivered' || status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            {count} {status}
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order History */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="p-6 sm:px-8 sm:py-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Order History</h3>
          
          {user.orders && user.orders.length > 0 ? (
            <div className="space-y-6">
              {user.orders.slice(0, 3).map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-4 bg-gray-50 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">Order #{order.id}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(order.date || order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium
                        ${
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'delivered' || order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.status}
                      </span>
                      <span className="ml-4 font-medium">${order.total}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Items ({order.items.length})</h5>
                    <ul className="space-y-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <li key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.quantity} × {item.name}
                          </span>
                          <span className="text-gray-800">${item.price}</span>
                        </li>
                      ))}
                    </ul>
                    {order.items.length > 3 && (
                      <button
                        onClick={() => toggleOrderExpansion(order.id)}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        {expandedOrders[order.id] ? (
                          <>
                            <FiChevronUp className="mr-1" /> Show less
                          </>
                        ) : (
                          <>
                            <FiChevronDown className="mr-1" /> Show {order.items.length - 3} more items
                          </>
                        )}
                      </button>
                    )}
                    {expandedOrders[order.id] && order.items.length > 3 && (
                      <ul className="mt-2 space-y-2">
                        {order.items.slice(3).map((item, index) => (
                          <li key={index + 3} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {item.quantity} × {item.name}
                            </span>
                            <span className="text-gray-800">${item.price}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
              
              {user.orders.length > 3 && (
                <div className="text-center">
                  <button
                    onClick={() => toggleOrderExpansion('all')}
                    className="text-blue-600 hover:text-blue-800 flex items-center justify-center mx-auto"
                  >
                    {expandedOrders['all'] ? (
                      <>
                        <FiChevronUp className="mr-1" /> Show fewer orders
                      </>
                    ) : (
                      <>
                        <FiChevronDown className="mr-1" /> Show all {user.orders.length} orders
                      </>
                    )}
                  </button>
                </div>
              )}
              
              {expandedOrders['all'] && user.orders.length > 3 && (
                <div className="space-y-6">
                  {user.orders.slice(3).map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="p-4 bg-gray-50 flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">Order #{order.id}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(order.date || order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium
                            ${
                              order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'delivered' || order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            {order.status}
                          </span>
                          <span className="ml-4 font-medium">${order.total}</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Items ({order.items.length})</h5>
                        <ul className="space-y-2">
                          {order.items.slice(0, 3).map((item, index) => (
                            <li key={index} className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                {item.quantity} × {item.name}
                              </span>
                              <span className="text-gray-800">${item.price}</span>
                            </li>
                          ))}
                        </ul>
                        {order.items.length > 3 && (
                          <button
                            onClick={() => toggleOrderExpansion(order.id)}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            {expandedOrders[order.id] ? (
                              <>
                                <FiChevronUp className="mr-1" /> Show less
                              </>
                            ) : (
                              <>
                                <FiChevronDown className="mr-1" /> Show {order.items.length - 3} more items
                              </>
                            )}
                          </button>
                        )}
                        {expandedOrders[order.id] && order.items.length > 3 && (
                          <ul className="mt-2 space-y-2">
                            {order.items.slice(3).map((item, index) => (
                              <li key={index + 3} className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                  {item.quantity} × {item.name}
                                </span>
                                <span className="text-gray-800">${item.price}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiBox className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-600">No orders found for this user.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetails;