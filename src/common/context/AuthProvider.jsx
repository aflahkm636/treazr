// context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          // In a real app, you would verify the token with your backend
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      // Mock API call - replace with your actual login endpoint
      const response = await axios.get(
        `http://localhost:3000/users?email=${credentials.email}&password=${credentials.password}`
      );
      
      if (response.data.length === 0) {
        throw new Error('Invalid credentials');
      }

      const user = response.data[0];
      
      // In a real app, you would get a token from your backend
      const mockToken = 'mock-jwt-token';
      
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);
      navigate('/');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      // Check if email exists
      const emailCheck = await axios.get(
        `http://localhost:3000/users?email=${userData.email}`
      );
      
      if (emailCheck.data.length > 0) {
        throw new Error('Email already registered');
      }

      // Create new user
      const newUser = {
        ...userData,
        role: 'user',
        isBlock: false,
        cart: [],
        orders: [],
        wishlist: [],
        created_at: new Date().toISOString(),
      };

      const response = await axios.post('http://localhost:3000/users', newUser);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      loading, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);