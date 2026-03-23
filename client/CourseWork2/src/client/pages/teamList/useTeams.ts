import { useEffect, useState } from 'react';
import { Team } from '../../types';
import { TeamsAPI } from '../../services/api';

export const useTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const data = (await TeamsAPI.getTeams()).data;
        setTeams(data);
      } catch (err) {
        setError('Ошибка загрузки команд');
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  return { teams, setTeams, loading, error };
};
