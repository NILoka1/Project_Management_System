import  { useEffect, useState } from 'react';
import {
  Card,
  Text,
  Group,
  Badge,
  Stack,
  Container,
  Title,
  Progress,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { IconEdit, IconClock, IconUser } from '@tabler/icons-react';
import { tasksAPI } from '../services/api';
import { Task } from '../types';

interface TaskListProps {
  projectId?: string; // Опционально: задачи конкретного проекта
}

export function TaskList({ projectId }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const response = await tasksAPI.getTasks(projectId);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Функция для получения цвета статуса
  const getStatusColor = (status: Task['status']) => {
    const colors = {
      BACKLOG: 'gray',
      TODO: 'blue',
      IN_PROGRESS: 'yellow',
      REVIEW: 'orange',
      TESTING: 'violet',
      DONE: 'green',
    };
    return colors[status];
  };

  // Функция для получения цвета приоритета
  const getPriorityColor = (priority: Task['priority']) => {
    const colors = {
      LOW: 'gray',
      MEDIUM: 'blue',
      HIGH: 'orange',
      URGENT: 'red',
    };
    return colors[priority];
  };

  if (loading) {
    return (
      <Container>
        <Text>Загрузка задач...</Text>
      </Container>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={2}>Задачи</Title>
        <Text c="dimmed">Всего задач: {tasks.length}</Text>
      </Group>

      {tasks.map((task) => (
        <Card key={task.id} shadow="sm" padding="lg" withBorder>
          <Group justify="space-between" align="flex-start" mb="xs">
            <Stack gap="xs" style={{ flex: 1 }}>
              <Group>
                <Text fw={500} size="lg">{task.title}</Text>
                <Badge color={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </Group>
              
              {task.description && (
                <Text size="sm" c="dimmed">
                  {task.description}
                </Text>
              )}

              <Group gap="md">
                <Badge color={getStatusColor(task.status)} variant="filled">
                  {task.status}
                </Badge>
                
                {task.dueDate && (
                  <Tooltip label="Срок выполнения">
                    <Group gap="xs">
                      <IconClock size={16} />
                      <Text size="sm">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </Text>
                    </Group>
                  </Tooltip>
                )}

                {task.assigneeId && (
                  <Tooltip label="Исполнитель">
                    <Group gap="xs">
                      <IconUser size={16} />
                      <Text size="sm">Назначена</Text>
                    </Group>
                  </Tooltip>
                )}
              </Group>
            </Stack>

            <ActionIcon variant="subtle" color="blue">
              <IconEdit size={18} />
            </ActionIcon>
          </Group>

          {/* Прогресс по времени (можно добавить позже) */}
          <Progress value={0} size="sm" mt="md" />
        </Card>
      ))}

      {tasks.length === 0 && (
        <Card>
          <Text ta="center" c="dimmed">
            Задачи не найдены. Создайте первую задачу!
          </Text>
        </Card>
      )}
    </Stack>
  );
}