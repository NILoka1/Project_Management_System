import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FullTeam, FullTeamUpdated } from '../../types';
import { TeamsAPI } from '../../services/api';
import { useDisclosure } from '@mantine/hooks';
import { useStatePage } from '../../func/useStatePage';

interface useFullTeamReturn {
  team: FullTeam;
  isUpdate: boolean;
  open: () => void;
  updatedTeam: FullTeamUpdated;
  setUpdatedTeam: React.Dispatch<React.SetStateAction<FullTeamUpdated>>;
  error: string;
  handleSave: () => Promise<void>;
  handleAddMembers: (userIds: string[]) => Promise<void>;
  handleAddProjects: (projectIds: string[]) => Promise<void>;
  loading: boolean;
}

export const useFullTeam = (): useFullTeamReturn => {
  const { teamId } = useParams<{ teamId: string }>();
  const [team, setTeam] = useState<FullTeam>();
  const [isUpdate, { open, close }] = useDisclosure(false);
  const [updatedTeam, setUpdatedTeam] = useState<FullTeamUpdated>();
  const { error, setError, loading, setLoading } = useStatePage();

  useEffect(() => {
    const getTeam = async (): Promise<void> => {
      try {
        const teamData = (await TeamsAPI.getTeam(teamId)).data;
        setTeam(teamData);
        setUpdatedTeam({ name: teamData.name, description: teamData.description });
      } catch {
        setError('Не удалось загрузить данные команды');
      } finally {
        setLoading(false);
      }
    };

    getTeam();
  }, [teamId]);

  // Обработчик сохранения
  const handleSave = async (): Promise<void> => {
    try {
      await TeamsAPI.updateTeam(teamId, updatedTeam);

      // Обновляем локальное состояние
      if (team) {
        setTeam({
          ...team,
          name: updatedTeam.name,
          description: updatedTeam.description,
        });
      }

      close(); // Закрываем режим редактирования
    } catch {
      setError('Ошибка при обновлении');
    }
  };

  const handleAddMembers = async (userIds: string[]): Promise<void> => {
    try {
      const response = await TeamsAPI.addMembers(teamId, userIds);
      const members = response.data.members;

      if (team) {
        setTeam({
          ...team,
          members: members,
        });
      }
    } catch {
      setError('Ошибка при добавлении участников');
    }
  };

  const handleAddProjects = async (projectIds: string[]): Promise<void> => {
    try {
      if (!team) return;

      // Вызов API для добавления проектов в команду
      const response = await TeamsAPI.addProjects(teamId, projectIds);

      // Обновляем локальное состояние
      setTeam({
        ...team,
        projects: response.data.projects,
      });
    } catch {
      setError('Ошибка при добавлении проектов');
    }
  };

  return {
    team,
    isUpdate,
    open,
    updatedTeam,
    setUpdatedTeam,
    error,
    handleSave,
    handleAddMembers,
    handleAddProjects,
    loading,
  };
};
