import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config/api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // Helps wait for API check

  // Run once when the app opens to check if the user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (token) => {
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const userData = await res.json();
        setCurrentUser(userData);
      } else {
        localStorage.removeItem('token'); // Token is invalid/expired
      }
    } catch (error) {
      console.error('API connection error:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestAuthEndpoint = async (endpoint, payload) => {
    const res = await fetch(`${API_URL}/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      const error = new Error(data.message || 'Request failed');
      error.code = data.code;
      error.email = data.email;
      throw error;
    }
    return data;
  };

  const login = async (query, password, identifierType) => {
    const data = await requestAuthEndpoint('login', { query, password, identifierType });

    localStorage.setItem('token', data.token); // Save the real JWT token
    setCurrentUser(data.user);

    // Returned so callers (e.g. the admin portal) can verify the account role.
    return data.user;
  };

  const register = async (userData) => {
    return requestAuthEndpoint('register', userData);
  };

  const verifyEmail = async (token) => {
    return requestAuthEndpoint('verify-email', { token });
  };

  const resendVerification = async (email) => {
    return requestAuthEndpoint('resend-verification', { email });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, login, register, verifyEmail, resendVerification, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;