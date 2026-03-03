import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/api';

interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  setUser: (user: any) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const data = await authService.login(email, password);
        set({ token: data.access_token, isAuthenticated: true });
        
        // Fetch user data
        const user = await authService.getCurrentUser();
        set({ user });
      },

      register: async (userData: any) => {
        await authService.register(userData);
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      setUser: (user: any) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);