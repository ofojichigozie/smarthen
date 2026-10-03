import { useState, useCallback } from 'react';
import { login as loginService } from '../services/auth.service';
import { Admin } from '../types/models';
import { notify } from '../utils/notification';
import { getMessage } from '../utils/errors';

export const useAuth = () => {
  const [admin, setAdmin] = useState<Admin | null>(() => {
    const stored = localStorage.getItem('smarthen-admin');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await loginService(email, password);

      // Store token and admin data
      localStorage.setItem('smarthen-token', response.token);
      localStorage.setItem('smarthen-admin', JSON.stringify(response.admin));
      setAdmin(response.admin);

      notify.success('Login successful');
      return response.admin;
    } catch (error) {
      notify.error(getMessage(error, 'Login failed'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('smarthen-token');
    localStorage.removeItem('smarthen-admin');
    setAdmin(null);
    notify.info('Logged out');
  }, []);

  const isAuthenticated = !!admin;

  return { admin, login, logout, loading, isAuthenticated };
};
