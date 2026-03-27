import { Button, Grid, Group, Stack, Text, TextInput, NumberInput, Select } from '@mantine/core';
import { JSX } from 'react';
import { FullProjects, ProjectForm } from '../../types/index';
import { DateInput } from '@mantine/dates';
import { useFullProject } from './useFullProject';
import { FullProjectTeams } from './FullProjectTeams';
import { FullProjectTasks } from './FullProjectTasks';
import { StatePage } from '../../components/StatePage';

const mapProjectToForm = (project: FullProjects): ProjectForm => ({
  name: project.name,
  description: project.description,
  status: project.status,
  progress: project.progress,
  budget: project.budget,
  startDate: project.startDate ? new Date(project.startDate) : null,
  endDate: project.endDate ? new Date(project.endDate) : null,
});

export const FullProject = (): JSX.Element => {
  const {
    project,
    isUpdate,
    open,
    close,
    updatedProject,
    setUpdatedProject,
    handleSave,
    error,
    loading,
  } = useFullProject();

  return (
    <StatePage error={error} loading={loading}>
      <Stack>
        <Group>
          <Text fw={700}>Название:</Text>
          <TextInput
            value={updatedProject.name}
            onChange={(event) => {
              setUpdatedProject({ ...updatedProject, name: event.currentTarget.value });
              open();
            }}
          />
        </Group>

        <Group>
          <Text fw={400}>Описание:</Text>
          <TextInput
            value={updatedProject.description}
            onChange={(event) => {
              setUpdatedProject({ ...updatedProject, description: event.currentTarget.value });
              open();
            }}
            style={{ minWidth: 300 }}
          />
        </Group>

        <Group>
          <Text fw={400}>Статус:</Text>
          <Select
            value={updatedProject.status}
            onChange={(event) => {
              setUpdatedProject({ ...updatedProject, status: event });
              open();
            }}
            data={[
              { value: 'PLANNING', label: 'Планирование' },
              { value: 'ACTIVE', label: 'Активный' },
              { value: 'ON_HOLD', label: 'На паузе' },
              { value: 'COMPLETED', label: 'Завершен' },
              { value: 'CANCELLED', label: 'Отменен' },
            ]}
          />
        </Group>

        <Group>
          <Text fw={400}>Прогресс:</Text>
          <NumberInput
            value={updatedProject.progress}
            onChange={(event) => {
              setUpdatedProject({ ...updatedProject, progress: Number(event) });
              open();
            }}
            min={0}
            max={100}
            suffix="%"
          />
        </Group>

        <Group>
          <Text fw={400}>Бюджет:</Text>
          <NumberInput
            value={updatedProject.budget || undefined}
            onChange={(event) => {
              setUpdatedProject({ ...updatedProject, budget: Number(event) });
              open();
            }}
            min={0}
            placeholder="Введите бюджет"
          />
        </Group>

        <Group>
          <Text fw={400}>Дата начала:</Text>
          <DateInput
            value={updatedProject.startDate}
            onChange={(value) => {
              setUpdatedProject({
                ...updatedProject,
                startDate: value ? new Date(value) : null,
              });
              open();
            }}
            placeholder="Выберите дату"
          />
        </Group>

        <Group>
          <Text fw={400}>Дата окончания:</Text>
          <DateInput
            value={updatedProject.endDate}
            onChange={(event) => {
              setUpdatedProject({ ...updatedProject, endDate: event ? new Date(event) : null });
              open();
            }}
            placeholder="Выберите дату"
          />
        </Group>

        {project?.createdAt && (
          <Group>
            <Text>Дата создания:</Text>
            <Text>{new Date(project.createdAt).toLocaleDateString()}</Text>
          </Group>
        )}

        <Grid>
          <FullProjectTeams project={project} />
          <FullProjectTasks project={project} />
        </Grid>

        {isUpdate && (
          <Group>
            <Button onClick={handleSave}>Сохранить</Button>
            <Button
              variant="outline"
              onClick={() => {
                // Отмена изменений - возвращаем исходные значения
                if (project) {
                  setUpdatedProject(mapProjectToForm(project));
                }
                close();
              }}
            >
              Отмена
            </Button>
          </Group>
        )}

        <Button variant="outline">Назад к проектам</Button>
      </Stack>
    </StatePage>
  );
};
