import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IUser } from '../interfaces/user.interface';

interface AuthState {
  user: IUser | null;
  setUser: (user: IUser) => void;
  clearUser: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: user => set({ user }),
      clearUser: () => set({ user: null }),
      isAuthenticated: () => get().user !== null,
    }),
    {
      name: 'auth-storage',
    }
  )
);
