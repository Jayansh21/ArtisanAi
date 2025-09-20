import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, AuthContextType, LoginCredentials, SignupCredentials, User, AuthResponse } from '../types/auth';
import { api } from '../services/api';

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
};

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, dispatch] = useReducer(authReducer, initialState);

  // Set up axios interceptor for token
  useEffect(() => {
    if (authState.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${authState.token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [authState.token]);

  // Check authentication on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      
      if (response.data.success) {
        // Immediately set token for follow-up calls before reducer effect runs
        const token = response.data.data.token;
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('token', token);

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data.data.user,
            token,
          },
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE' });
      
      // Enhanced error handling for login
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (error.message === 'Network Error') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      } else if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Login failed. Please try again.');
      }
    }
  };

  const signup = async (credentials: SignupCredentials): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      // Send signup request to backend
      const response = await api.post<AuthResponse>('/auth/signup', credentials);
      
      if (response.data.success) {
        // Verify the response contains valid user data
        if (response.data.data.user && response.data.data.token) {
          // Immediately set token so subsequent calls (like /auth/me) succeed
          const token = response.data.data.token;
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          localStorage.setItem('token', token);

          // Update authentication state with user data from database
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: response.data.data.user,
              token,
            },
          });
          
          // Log successful signup for debugging
          console.log('User successfully registered and saved to database:', response.data.data.user);
        } else {
          throw new Error('Invalid response from server');
        }
      } else {
        throw new Error(response.data.message || 'Signup failed');
      }
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE' });
      
      // Enhanced error handling with better user messages
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else if (error.message === 'Network Error') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      } else if (error.response?.status === 409) {
        throw new Error('An account with this email already exists');
      } else if (error.response?.status === 400) {
        const validationErrors = error.response.data.errors;
        if (validationErrors && Array.isArray(validationErrors)) {
          const firstError = validationErrors[0];
          throw new Error(firstError.msg || 'Please check your information and try again');
        }
        throw new Error('Please check your information and try again');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to create account. Please try again.');
      }
    }
  };

  const logout = (): void => {
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      const response = await api.put('/auth/profile', userData);
      
      if (response.data.success) {
        dispatch({
          type: 'UPDATE_USER',
          payload: response.data.data.user,
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  };

  const checkAuth = async (): Promise<void> => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await api.get('/auth/me');
      
      if (response.data.success) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data.data.user,
            token,
          },
        });
      } else {
        throw new Error('Invalid token');
      }
    } catch (error) {
      // Proactively clear invalid/expired tokens
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      dispatch({ type: 'AUTH_FAILURE' });
    }
  };

  // Verify user data is properly saved in database
  const verifyUserData = async (): Promise<boolean> => {
    try {
      const response = await api.get('/auth/me');
      return response.data.success && response.data.data.user;
    } catch (error) {
      console.error('User verification failed:', error);
      return false;
    }
  };

  const contextValue: AuthContextType = {
    authState,
    login,
    signup,
    logout,
    updateProfile,
    checkAuth,
    verifyUserData,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
