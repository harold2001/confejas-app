import { useMutation } from '@tanstack/react-query';
import { useIonRouter } from '@ionic/react';
import toast from 'react-hot-toast';
import { Preferences } from '@capacitor/preferences';
import { useAuthStore } from '../store/useAuthStore';
import { login } from '../api/auth.api';

export const useAuth = () => {
  const router = useIonRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      // Store both access and refresh tokens in Capacitor Preferences
      await Preferences.set({ key: 'accessToken', value: data.accessToken });
      await Preferences.set({ key: 'refreshToken', value: data.refreshToken });

      // Store user data in Zustand (not the tokens)
      setUser(data.user);

      // Show success toast
      toast.success(`¡Bienvenido de nuevo, ${data.user.firstName}!`);

      // Redirect to dashboard
      router.push('/dashboard', 'root', 'replace');
    },
    onError: () => {
      toast.error('Credenciales inválidas');
    },
  });

  const logout = async () => {
    // Clear both tokens from Capacitor Preferences
    await Preferences.remove({ key: 'accessToken' });
    await Preferences.remove({ key: 'refreshToken' });

    // Clear user data from Zustand
    clearUser();
    toast.success('Sesión cerrada con éxito');
    router.push('/auth/login', 'root', 'replace');
  };

  return {
    login: loginMutation.mutate,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
    logout,
  };
};
