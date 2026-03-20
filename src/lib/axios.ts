import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  password2: string
  first_name: string
  last_name: string
}

export interface User {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
}

export interface Task {
  id: number
  title: string
  description: string
  category: string
  budget: number
  location: string
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  creator: User
  created_at: string
  updated_at: string
}

export interface Campaign {
  id: number
  title: string
  description: string
  category: string
  target_amount: number
  raised_amount: number
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  creator: User
  end_date: string
  created_at: string
}

export interface Transaction {
  id: number
  amount: number
  type: 'credit' | 'debit'
  status: 'pending' | 'completed' | 'failed'
  description: string
  created_at: string
}

export interface Wallet {
  balance: number
  currency: string
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
})

// Request interceptor with debugging
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Log request for debugging
    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data,
      headers: config.headers,
    })
    
    return config
  },
  (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor with debugging
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      data: response.data,
      url: response.config.url,
    })
    return response
  },
  async (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      message: error.message,
    })

    const originalRequest = error.config

    // Handle token refresh on 401
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login/') {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        })

        const { access } = response.data
        localStorage.setItem('access_token', access)

        originalRequest.headers.Authorization = `Bearer ${access}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance