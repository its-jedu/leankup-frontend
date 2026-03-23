import { createContext, useState, useEffect, ReactNode } from 'react';
import axiosInstance, { User, LoginCredentials, RegisterData } from '../lib/axios';
import { useNavigate } from 'react-router-dom';
import { showToast } from '@/lib/toast';
import { useTheme } from './ThemeContext';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { theme } = useTheme(); // Get current theme

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get<User>('/users/me/');
      setUser(response.data);
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        showToast.error('Network Error', {
          description: "Can't connect to server."
        });
      } else if (error.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await axiosInstance.post('/auth/login/', credentials);
      const { access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Save theme preference before navigation
      localStorage.setItem('theme', theme);
      
      await fetchUser();
      showToast.success('Login Successful!', {
        description: 'Welcome back to LeankUp!'
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        showToast.error('Network Error', {
          description: "Can't connect to server."
        });
      } else if (error.response?.status === 401) {
        showToast.error('Login Failed', {
          description: error.response?.data?.detail || 'Invalid username or password'
        });
      } else if (error.response?.status === 400) {
        const errorData = error.response?.data;
        const errorMessage = Object.values(errorData).flat()[0] || 'Invalid input';
        showToast.error('Validation Error', {
          description: errorMessage
        });
      } else {
        showToast.error('Login Failed', {
          description: error.response?.data?.detail || 'An unexpected error occurred'
        });
      }
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await axiosInstance.post('/auth/register/', userData);
      const { access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Save theme preference before navigation
      localStorage.setItem('theme', theme);
      
      await fetchUser();
      showToast.success('Registration Successful!', {
        description: 'Your account has been created successfully.'
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        showToast.error('Network Error', {
          description: "Can't connect to server."
        });
      } else if (error.response?.status === 400) {
        const errorData = error.response?.data;
        let errorMessage = 'Registration failed';
        
        if (errorData.username) {
          errorMessage = `Username: ${errorData.username[0]}`;
        } else if (errorData.email) {
          errorMessage = `Email: ${errorData.email[0]}`;
        } else if (errorData.password) {
          errorMessage = `Password: ${errorData.password[0]}`;
        } else if (errorData.password2) {
          errorMessage = `Confirm Password: ${errorData.password2[0]}`;
        } else if (errorData.first_name) {
          errorMessage = `First Name: ${errorData.first_name[0]}`;
        } else if (errorData.last_name) {
          errorMessage = `Last Name: ${errorData.last_name[0]}`;
        } else if (typeof errorData === 'object') {
          const firstError = Object.values(errorData).flat()[0];
          errorMessage = firstError || 'Invalid input';
        }
        
        showToast.error('Registration Failed', {
          description: errorMessage
        });
      } else {
        showToast.error('Registration Failed', {
          description: error.response?.data?.detail || 'An unexpected error occurred'
        });
      }
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout/');
      showToast.info('Logged Out', {
        description: 'You have been successfully logged out.'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      navigate('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};