import {
  Button,
  Flex,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  NumberInput,
  Select,
} from '@mantine/core';
import { JSX, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FullProjects } from '../types/index';
import { ProjectAPI } from '../services/api';
import { useDisclosure } from '@mantine/hooks';
import { DateInput } from '@mantine/dates';

export const FullProject = (): JSX.Element => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<FullProjects>();
  const [isUpdate, { open, close }] = useDisclosure(false);

  // Состояния для хранения измененных данных
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [budget, setBudget] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    const getProject = async (): Promise<void> => {
      const projectData = (await ProjectAPI.getProject(projectId)).data;
      setProject(projectData);
      // Инициализируем состояния данными из API
      setName(projectData.name);
      setDescription(projectData.description || '');
      setStatus(projectData.status);
      setProgress(projectData.progress);
      setBudget(projectData.budget);
      setStartDate(projectData.startDate ? new Date(projectData.startDate) : null);
      setEndDate(projectData.endDate ? new Date(projectData.endDate) : null);
    };

    getProject();
  }, [projectId]);

  // Обработчик сохранения
  const handleSave = async (): Promise<void> => {
    try {
      await ProjectAPI.updateProject(projectId, {
        name,
        description,
        status,
        progress,
        budget,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      });

      // Обновляем локальное состояние
      if (project) {
        setProject({
          ...project,
          name,
          description,
          status,
          progress,
          budget,
          startDate: startDate?.toISOString() || null,
          endDate: endDate?.toISOString() || null,
        });
      }

      close(); // Закрываем режим редактирования
    } catch (error) {
      console.error('Ошибка при обновлении:', error);
    }
  };

  // Обработчики изменений
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<any>>) => {
    return (value: any) => {
      setter(value);
      open();
    };
  };

  return (
    <>
      <Stack>
        <Group>
          <Text fw={700}>Название:</Text>
          <TextInput
            value={name}
            onChange={(event) => {
              setName(event.currentTarget.value);
              open();
            }}
          />
        </Group>

        <Group>
          <Text fw={400}>Описание:</Text>
          <TextInput
            value={description}
            onChange={(event) => {
              setDescription(event.currentTarget.value);
              open();
            }}
            style={{ minWidth: 300 }}
          />
        </Group>

        <Group>
          <Text fw={400}>Статус:</Text>
          <Select
            value={status}
            onChange={handleInputChange(setStatus)}
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
            value={progress}
            onChange={handleInputChange(setProgress)}
            min={0}
            max={100}
            suffix="%"
          />
        </Group>

        <Group>
          <Text fw={400}>Бюджет:</Text>
          <NumberInput
            value={budget || undefined}
            onChange={handleInputChange(setBudget)}
            min={0}
            placeholder="Введите бюджет"
          />
        </Group>

        <Group>
          <Text fw={400}>Дата начала:</Text>
          <DateInput
            value={startDate}
            onChange={handleInputChange(setStartDate)}
            placeholder="Выберите дату"
          />
        </Group>

        <Group>
          <Text fw={400}>Дата окончания:</Text>
          <DateInput
            value={endDate}
            onChange={handleInputChange(setEndDate)}
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
          <Grid.Col span={6}>
            <Paper bg={'gray.5'} p={'md'}>
              <Stack>
                <Text fw={500}>Команды:</Text>
                <Flex wrap={'wrap'} gap="sm">
                  {project?.teams?.map((team) => (
                    <Paper key={team.id} p={'sm'} bg={'gray.3'}>
                      <Text fw={500}>{team.name}</Text>
                      <Text size="sm">{team.description}</Text>
                    </Paper>
                  ))}
                </Flex>
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={6}>
            <Paper bg={'gray.5'} p={'md'}>
              <Stack>
                <Text fw={500}>Задачи:</Text>
                <Flex gap={'sm'} wrap={'wrap'}>
                  {project?.tasks?.map((task) => (
                    <Paper key={task.id} p={'sm'} bg={'gray.3'}>
                      <Text fw={500}>{task.title}</Text>
                      <Text size="sm">Статус: {task.status}</Text>
                      <Text size="sm">Приоритет: {task.priority}</Text>
                    </Paper>
                  ))}
                </Flex>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>

        {isUpdate && (
          <Group>
            <Button onClick={handleSave}>Сохранить</Button>
            <Button
              variant="outline"
              onClick={() => {
                // Отмена изменений - возвращаем исходные значения
                if (project) {
                  setName(project.name);
                  setDescription(project.description || '');
                  setStatus(project.status);
                  setProgress(project.progress);
                  setBudget(project.budget);
                  setStartDate(project.startDate ? new Date(project.startDate) : null);
                  setEndDate(project.endDate ? new Date(project.endDate) : null);
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
    </>
  );
};
