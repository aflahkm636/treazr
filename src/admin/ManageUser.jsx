// components/ManageUsers.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import SearchBar from './SearchBar';
import Loading from '../common/components/Loading';
import { FiEye, FiTrash2, FiUser, FiUserX, FiUserCheck } from 'react-icons/fi';
import { URL } from '../services/Api';

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${URL}/users`);
        setUsers(response.data);
        setFilteredUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    let results = users;
    
    if (roleFilter !== 'all') {
      results = results.filter(user => user.role === roleFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(user => 
        user.name.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term) ||
        user.id.toString().includes(term)
      );
    }
    
    setFilteredUsers(results);
  }, [searchTerm, roleFilter, users]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const result = await Swal.fire({
        title: 'Confirm Status Change',
        text: `Are you sure you want to ${currentStatus ? 'unblock' : 'block'} this user?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: `Yes, ${currentStatus ? 'Unblock' : 'Block'}`
      });

      if (result.isConfirmed) {
        await axios.patch(`${URL}/users/${userId}`, {
          isBlock: !currentStatus
        });

        setUsers(users.map(user => 
          user.id === userId ? { ...user, isBlock: !currentStatus } : user
        ));

        toast.success(`User ${currentStatus ? 'unblocked' : 'blocked'} successfully`);
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
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
        setUsers(users.filter(user => user.id !== userId));
        toast.success('User deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleViewUser = (userId) => {
    navigate(`/admin/users-details/${userId}`);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <Loading name="ManageUser"/>
    </div>;
  }


  return (
    <div className="container mx-auto px-4 py-8">
       <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-xl font-semibold text-gray-800">User Management</h1>
            
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
              <div className="w-full sm:w-64">
                <SearchBar 
                  value={searchTerm} 
                  onChange={handleSearch} 
                  placeholder="Search users..." 
                />
              </div>
              
              <div className="w-full sm:w-48">
                <div className="relative">
                  <select
                    value={roleFilter}
                    onChange={handleRoleFilterChange}
                    className="block w-full pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  >
                    <option value="all">All Users</option>
                    <option value="admin">Admins</option>
                    <option value="user">Standard Users</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <FiUser className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                        {user.role === 'admin' ? 'Admin' : 'Standard User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => toggleUserStatus(user.id, user.isBlock)}
                          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50
                            ${user.isBlock 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200 focus:ring-red-500'
                            }`}
                        >
                          {user.isBlock ? (
                            <span className="flex items-center">
                              <FiUserCheck className="mr-1.5" /> Unblock
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <FiUserX className="mr-1.5" /> Block
                            </span>
                          )}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {user.role !== 'admin' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewUser(user.id)}
                            className="text-blue-600 hover:text-blue-900 flex items-center px-2.5 py-1 rounded-md hover:bg-blue-50 transition-colors"
                            title="View user"
                          >
                            <FiEye className="mr-1.5" /> View
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 flex items-center px-2.5 py-1 rounded-md hover:bg-red-50 transition-colors"
                            title="Delete user"
                          >
                            <FiTrash2 className="mr-1.5" /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <div className="text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="mt-2 text-sm font-medium">No users found matching your criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
   </div>
  );
};

export default ManageUser;