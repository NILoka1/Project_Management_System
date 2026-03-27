import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FullProjects, ProjectForm } from '../../types/index';
import { ProjectAPI } from '../../services/api';
import { useDisclosure } from '@mantine/hooks';
import { Dispatch, SetStateAction } from 'react';
import { useStatePage } from '../../func/useStatePage';

interface UseFullProjectReturn {
  project: FullProjects | undefined;
  isUpdate: boolean;
  open: () => void;
  close: () => void;
  updatedProject: ProjectForm | undefined;
  setUpdatedProject: Dispatch<SetStateAction<ProjectForm | undefined>>;
  handleSave: () => Promise<void>;
  error: string;
  loading: boolean;
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
  const [isUpdate, { open, close }] = useDisclosure(false);
  const { error, setError, loading, setLoading } = useStatePage();

  const [updatedProject, setUpdatedProject] = useState<ProjectForm>();

  useEffect(() => {
    const getProject = async (): Promise<void> => {
      try {
        const projectData = (await ProjectAPI.getProject(projectId)).data;
        setProject(projectData);
        setUpdatedProject(mapProjectToForm(projectData));
      } catch {
        setError('не удалось загрузить данные проекта');
      } finally {
        setLoading(false);
      }
    };

    getProject();
  }, [projectId]);

  // Обработчик сохранения
  const handleSave = async (): Promise<void> => {
    try {
      await ProjectAPI.updateProject(projectId, {
        ...updatedProject,
        startDate: updatedProject.startDate?.toISOString(),
        endDate: updatedProject.endDate?.toISOString(),
      });

      // Обновляем локальное состояние
      if (project) {
        setProject({
          ...project,
          ...updatedProject,
          startDate: updatedProject.startDate?.toISOString(),
          endDate: updatedProject.endDate?.toISOString(),
        });
      }

      close(); // Закрываем режим редактирования
    } catch (error) {
      console.error('Ошибка при обновлении:', error);
    }
  };

  return {
    project,
    isUpdate,
    open,
    close,
    updatedProject,
    setUpdatedProject,
    handleSave,
    error,
    loading,
  };
};
