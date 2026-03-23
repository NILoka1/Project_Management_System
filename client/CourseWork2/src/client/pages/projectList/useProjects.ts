import { useEffect, useState } from 'react';
import { Project } from '../../types';
import { ProjectAPI } from '../../services/api';

export const useProject = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getData = async (): Promise<void> => {
      try {
        setProjects((await ProjectAPI.getProjects()).data);
      } catch (err) {
        setError('Ошибка загрузки проектов');
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  return { projects, setProjects, loading, error };
};
