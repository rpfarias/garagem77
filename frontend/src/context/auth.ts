import { create } from 'zustand';
import { apiClient } from '@/services/api';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  checkAuth: () => void;
}

// O estado inicial deve ser idêntico no server e no primeiro render do client
// para evitar hydration mismatch. checkAuth() popula a partir do localStorage no client
// dentro de um useEffect (sempre depois do primeiro render).
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  isInitialized: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.login(email, password);
      set({
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    apiClient.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitialized: true,
    });
  },

  setUser: (user: User) => {
    set({ user });
  },

  checkAuth: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('auth_token');
    set({
      token: token || null,
      isAuthenticated: !!token,
      isInitialized: true,
    });
  },
}));
