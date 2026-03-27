import { useEffect, useState } from 'react';
import { Task, TaskStatus } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { tasksAPI } from '../../services/api';

export const useUniversalTask = ({ type }: { type: 'all' | 'solo' | 'done' | 'backlog' }) => {
  const [task, setTask] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const checkType = async (): Promise<{
    data: Task[];
  }> => {
    switch (type) {
      case 'all':
        return await tasksAPI.getAllTask();
      case 'solo':
        return await tasksAPI.getPersonalTask();
      case 'done':
        return await tasksAPI.getDoneTask();
      case 'backlog':
        return await tasksAPI.getBacklogTask();
    }
  };

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setTask((await checkType()).data);
      } catch {
        setError('Ошибка загрузки задач');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [type]);

  const handleStatusChange = async (newStatus: TaskStatus, taskId: string): Promise<void> => {
    await tasksAPI.updateTaskStatus(taskId, newStatus);
    setTask((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
  };

  return { task, loading, error, user, handleStatusChange };
};
