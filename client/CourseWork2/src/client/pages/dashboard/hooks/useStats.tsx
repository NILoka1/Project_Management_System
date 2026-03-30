// components/DashboardStats.tsx
import { useEffect, useState } from 'react';
import type { DashboardStats } from '../../../types';
import { dashboardAPI } from '../../../services/api';
import { useStatePage } from '../../../StatePage/useStatePage';

export const useStats = () => {
  const [stats, setStats] = useState<DashboardStats>();
  const { error, setError, loading, setLoading } = useStatePage();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardAPI.getDashboardStats();
        setStats(response.data);
      } catch (error) {
        setError('Ошибка загрузки статистики');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);
  return { stats, error, loading };
};
