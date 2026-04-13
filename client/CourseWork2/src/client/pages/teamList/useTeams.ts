import { useEffect, useState } from 'react';
import { Team } from '../../types';
import { TeamsAPI } from '../../services/api';
import { useStatePage } from '../../StatePage/useStatePage';

export const useTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const { error, setError, loading, setLoading } = useStatePage();

  useEffect(() => {
    const getData = async () => {
      try {
        const data = (await TeamsAPI.getTeams()).data;
        setTeams(data);
      } catch {
        setError('Ошибка загрузки команд');
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  return { teams, setTeams, loading, error };
};
