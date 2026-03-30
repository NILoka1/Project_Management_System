import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FullTeam, FullTeamUpdated } from '../../types';
import { TeamsAPI } from '../../services/api';
import { useStatePage } from '../../StatePage/useStatePage';
import { useForm, UseFormReturnType } from '@mantine/form';
import { useNavigate, NavigateFunction } from 'react-router-dom';
interface useFullTeamReturn {
  team: FullTeam;
  error: string;
  handleSubmit: (event?: React.FormEvent<HTMLFormElement>) => void;
  handleAddMembers: (userIds: string[]) => Promise<void>;
  handleAddProjects: (projectIds: string[]) => Promise<void>;
  loading: boolean;
  form: UseFormReturnType<
    {
      name: string;
      description: string;
    },
    (values: { name: string; description: string }) => {
      name: string;
      description: string;
    }
  >;
  navigate: NavigateFunction;
  handleCancel: () => void;
}

export const useFullTeam = (): useFullTeamReturn => {
  const { teamId } = useParams<{ teamId: string }>();
  const [team, setTeam] = useState<FullTeam>();
  const { error, setError, loading, setLoading } = useStatePage();
  const navigate = useNavigate();
  const form = useForm<FullTeamUpdated>({
    validateInputOnBlur: true,
    initialValues: {
      name: '',
      description: '',
    },
    validate: {
      name: (val) => val.length < 3 && 'Слишком короткое название',
    },
  });

  useEffect(() => {
    const getTeam = async (): Promise<void> => {
      try {
        const teamData = (await TeamsAPI.getTeam(teamId)).data;
        setTeam(teamData);
        form.setValues({ ...teamData });
        form.resetDirty();
      } catch {
        setError('Не удалось загрузить данные команды');
      } finally {
        setLoading(false);
      }
    };

    getTeam();
  }, [teamId]);

  const handleCancel = (): void => {
    form.setValues({ ...team });
    form.resetDirty();
  };
  const handleSubmit = form.onSubmit(async () => {
    try {
      await TeamsAPI.updateTeam(teamId, form.getValues());

      // Обновляем локальное состояние
      if (team) {
        setTeam({
          ...team,
          ...form.getValues(),
        });
      }

      form.resetDirty();
    } catch {
      setError('Ошибка при обновлении');
    }
  });

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
    error,
    handleSubmit,
    handleAddMembers,
    handleAddProjects,
    loading,
    form,
    handleCancel,
    navigate,
  };
};
