import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FullProjects, ProjectForm } from '../../types/index';
import { ProjectAPI } from '../../services/api';
import { useStatePage } from '../../StatePage/useStatePage';
import { useForm, UseFormReturnType } from '@mantine/form';
import { useNavigate, NavigateFunction } from 'react-router-dom';

interface UseFullProjectReturn {
  project: FullProjects | undefined;
  handleSave: (event?: React.FormEvent<HTMLFormElement>) => void;
  handleCancel: () => void;
  error: string;
  loading: boolean;
  form: UseFormReturnType<ProjectForm, (values: ProjectForm) => ProjectForm>;
  navigate: NavigateFunction;
}

const mapProjectToForm = (project: FullProjects): ProjectForm => ({
  name: project.name,
  description: project.description,
  status: project.status,
  progress: project.progress,
  budget: project.budget,
  startDate: project.startDate ? new Date(project.startDate) : null,
  endDate: project.endDate ? new Date(project.endDate) : null,
});

export const useFullProject = (): UseFullProjectReturn => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<FullProjects>();
  const { error, setError, loading, setLoading } = useStatePage();
  const navigate = useNavigate();
  const form = useForm<ProjectForm>({
    validateInputOnBlur: true,
    initialValues: {
      name: '',
      description: '',
      status: '',
      progress: 0,
      budget: 0,
      startDate: null,
      endDate: null,
    },
    validate: {
      name: (val) => val.length < 3 && 'Слишком короткое название',
      startDate: (val, values) => {
        if (!val || !values.endDate) return null;
        return val > values.endDate ? 'Дата начала не может быть позже даты окончания' : null;
      },

      endDate: (val, values) => {
        if (!val || !values.startDate) return null;
        return val < values.startDate ? 'Дата окончания не может быть раньше даты начала' : null;
      },
    },
  });

  useEffect(() => {
    const getProject = async (): Promise<void> => {
      try {
        const projectData = (await ProjectAPI.getProject(projectId)).data;
        setProject(projectData);
        form.setValues(mapProjectToForm(projectData));
        form.resetDirty();
      } catch {
        setError('не удалось загрузить данные проекта');
      } finally {
        setLoading(false);
      }
    };
    getProject();
  }, [projectId]);

  // Обработчик сохранения
  const handleSave = form.onSubmit(async () => {
    try {
      await ProjectAPI.updateProject(projectId, {
        ...form.getValues(),
        startDate: form.getValues().startDate?.toISOString(),
        endDate: form.getValues().endDate?.toISOString(),
      });

      // Обновляем локальное состояние
      if (project) {
        setProject({
          ...project,
          ...form.getValues(),
          startDate: form.getValues().startDate?.toISOString(),
          endDate: form.getValues().endDate?.toISOString(),
        });
      }
      form.resetDirty();
    } catch {
      setError('Ошибка сохранения');
    }
  });

  const handleCancel: () => void = () => {
    form.setValues(mapProjectToForm(project));
    form.resetDirty();
  };

  return {
    project,
    handleSave,
    handleCancel,
    error,
    loading,
    form,
    navigate,
  };
};
