import { useEffect, useState } from 'react';
import { Task, TaskStatus } from '../../../types';
import { tasksAPI } from '../../../services/api';
import { useAuthStore } from '../../../store/authStore';

export const useTasks = (solo: boolean) => {
  const [tasks, setTasks] = useState<Task[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        let response;
        if (solo) {
          response = await tasksAPI.getPersonalTask();
        } else {
          response = await tasksAPI.getAllTask();
        }

        setTasks(response.data);
      } catch {
        setError('Ошибка загрузки задач');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  });

  const handleStatusChange = async (newStatus: TaskStatus, taskId: string): Promise<void> => {
    await tasksAPI.updateTaskStatus(taskId, newStatus);
    setTasks(
      tasks.filter((task) => {
        return task.id != taskId;
      }),
    );
  };

  return { tasks, user, handleStatusChange, loading, error };
};
