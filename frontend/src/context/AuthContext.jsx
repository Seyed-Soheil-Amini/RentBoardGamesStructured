import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setupAxiosInterceptors = () => {
    axios.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  };

  useEffect(() => {
    setupAxiosInterceptors();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }
      const response = await axios.get('/api/auth/me/');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch profile', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/auth/token/', { username, password });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      await fetchProfile();
      return true;
    } catch (error) {
      console.error('Login error', error);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      await axios.post('/api/auth/register/', userData);
      // Auto login after registration
      return await login(userData.username, userData.password);
    } catch (error) {
      console.error('Registration error', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const refreshWallet = async () => {
    await fetchProfile();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshWallet }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
