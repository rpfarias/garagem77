import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/api';
import { AxiosError } from 'axios';

interface FetchState<T> {
  data: T | null;
  error: AxiosError | null;
  isLoading: boolean;
}

export function useFetch<T>(url: string, dependencies: any[] = []) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    isLoading: true,
  });

  const fetchData = useCallback(async () => {
    setState({ data: null, error: null, isLoading: true });
    try {
      const data = await apiClient.get<T>(url);
      setState({ data, error: null, isLoading: false });
    } catch (error) {
      setState({ data: null, error: error as AxiosError, isLoading: false });
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  return { ...state, refetch: fetchData };
}
