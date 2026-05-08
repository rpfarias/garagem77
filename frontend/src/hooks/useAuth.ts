import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/context/auth';

export function useAuth() {
  const router = useRouter();
  const {
    user,
    token,
    isLoading,
    isAuthenticated,
    isInitialized,
    login,
    logout,
    setUser,
    checkAuth,
  } = useAuthStore();

  // Sincroniza com localStorage uma vez se ainda não foi feito
  useEffect(() => {
    if (!isInitialized) checkAuth();
  }, [isInitialized, checkAuth]);

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
    isInitialized,
    login: handleLogin,
    logout: handleLogout,
    setUser,
  };
}
