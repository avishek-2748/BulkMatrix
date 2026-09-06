import React, { createContext, useState, useEffect, useContext } from 'react';
import { getMe, login as apiLogin, signup as apiSignup, logout as apiLogout } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      // Only try to fetch user if a token exists in localStorage
      const token = localStorage.getItem('bm_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const userData = await getMe();
        setUser(userData);
      } catch (error) {
        // Token invalid or expired — clean up
        localStorage.removeItem('bm_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (credentials) => {
    const userData = await apiLogin(credentials);
    setUser(userData);
    return userData;
  };

  const signup = async (data) => {
    const userData = await apiSignup(data);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
