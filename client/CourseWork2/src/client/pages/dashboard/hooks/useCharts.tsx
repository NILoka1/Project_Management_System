// components/DeveloperCharts.tsx
import { useEffect, useState } from 'react';
import { dashboardAPI } from '../../../services/api';
import { ProductivityData, TimeStats } from '../../../types';
import { useStatePage } from '../../../StatePage/useStatePage';

export const useCharts = () => {
  const [productivityData, setProductivityData] = useState<ProductivityData | null>(null);
  const [timeStats, setTimeStats] = useState<TimeStats | null>(null);
  const { error, setError, loading, setLoading } = useStatePage();
  const loadData = async () => {
    try {
      const [productivityResponse, timeResponse] = await Promise.all([
        dashboardAPI.getProductivityData('week'),
        dashboardAPI.getTimeStats('week'),
      ]);

      const productivityData = (productivityResponse as any)?.data?.data;
      const timeStats = (timeResponse as any)?.data?.data;

      if (productivityData) {
        setProductivityData(productivityData);
      } else {
        console.warn('❌ No productivity data in response');
        setProductivityData(null);
      }

      if (timeStats) {
        setTimeStats(timeStats);
      } else {
        console.warn('❌ No time stats data in response');
        setTimeStats(null);
      }
    } catch (err) {
      setError('Не удалось загрузить данные аналитики');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
  }, []);

  return { productivityData, timeStats, loadData, error, loading };
};
