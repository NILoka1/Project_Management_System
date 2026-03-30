import { useEffect, useState } from 'react';
import { dashboardAPI } from '../../../services/api';
import { Task } from '../../../types';
import { useStatePage } from '../../../StatePage/useStatePage';
import { useNavigate } from 'react-router-dom';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { error, setError, loading, setLoading } = useStatePage();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await dashboardAPI.getUserTasks();
        setTasks(response.data);
      } catch (error) {
        setError('ошибка загрузки задач');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const activeTasks = tasks
    .filter((task) => task.status === 'IN_PROGRESS' || task.status === 'TODO')
    .slice(0, 5); // Показываем только 5 активных задач

  return { activeTasks, error, loading, navigate };
};
