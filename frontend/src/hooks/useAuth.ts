import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/context/auth';

export function useAuth() {
  const router = useRouter();
  const { user, token, isLoading, isAuthenticated, login, logout, setUser, checkAuth } =
    useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    login: handleLogin,
    logout: handleLogout,
    setUser,
  };
}
