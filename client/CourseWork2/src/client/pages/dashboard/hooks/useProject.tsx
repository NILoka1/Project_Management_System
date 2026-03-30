import { useEffect, useState } from 'react';
import { dashboardAPI } from '../../../services/api';
import { Project } from '../../../types';
import { useStatePage } from '../../../StatePage/useStatePage';
export const useProject = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const { error, setError, loading, setLoading } = useStatePage();
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await dashboardAPI.getUserProjects();
      setProjects(response.data);
    } catch (error) {
      setError('Ошибка загрузки проектов');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Project['status']) => {
    const colors = {
      PLANNING: 'gray',
      ACTIVE: 'blue',
      ON_HOLD: 'yellow',
      COMPLETED: 'green',
      CANCELLED: 'red',
    };
    return colors[status];
  };

  const activeProjects = projects.filter((p) => p.status === 'ACTIVE').slice(0, 3);
  return { activeProjects, getStatusColor, error, loading };
};
