import { JSX } from 'react';
import { Role } from '../../../types';
import { ActionIcon, Badge, Button, Flex, Group, Paper, Stack, Text } from '@mantine/core';
import { IconClock, IconEdit } from '@tabler/icons-react';
import { getStatusColor, getPriorityColor } from '../../../func/colors';
import { NewTask } from '../../../components/modal/newTask';
import { TaskTimer } from '../../../components/TaskTimer';
import { useTasks } from './useTasks';

const Tasks = ({ role, solo }: { role: Role; solo: boolean }): JSX.Element => {
  const { tasks, user, handleStatusChange, loading, error } = useTasks(solo);

  if (loading) {
    return <Text>Загрузка...</Text>;
  }
  if (error) {
    return <Text>{error}</Text>;
  }
  if (tasks.length === 0) {
    return <Text>Нет задач</Text>;
  }

  return (
    <>
      <Flex m={'md'}>{((!solo && role === 'MANAGER') || role === 'TEAM_LEAD') && <NewTask />}</Flex>

      {tasks.map((task) => {
        return (
          <Paper key={task.id} p="sm" withBorder>
            <Group justify="space-between">
              <Stack gap={4} style={{ flex: 1 }}>
                <Text fw={500}>{task.title || 'Без названия'}</Text>
                {task.description && (
                  <Text size="sm" c="dimmed" lineClamp={1}>
                    {task.description}
                  </Text>
                )}

                <Group gap="xs">
                  <Badge color={getStatusColor(task.status)} size="sm">
                    {task.status}
                  </Badge>
                  <Badge color={getPriorityColor(task.priority)} size="sm">
                    {task.priority}
                  </Badge>
                  {task.dueDate && (
                    <Group gap={4}>
                      <IconClock size={14} />
                      <Text size="xs">{new Date(task.dueDate).toLocaleDateString()}</Text>
                    </Group>
                  )}
                </Group>
              </Stack>

              <Group gap="xs">
                {role === 'DEVELOPER' || role === 'TESTER' ? (
                  <TaskTimer taskId={task.id} taskTitle={task.title} />
                ) : (
                  <ActionIcon variant="outline" color="blue" title="Редактировать задачу">
                    <IconEdit size={16}></IconEdit>
                  </ActionIcon>
                )}
                {task.status === 'TODO' && task.assigneeId === user?.id && (
                  <Button
                    size="xs"
                    color="blue"
                    onClick={() => handleStatusChange('IN_PROGRESS', task.id)}
                  >
                    Взять в работу
                  </Button>
                )}

                {task.status === 'IN_PROGRESS' && task.assigneeId === user?.id && (
                  <Button
                    size="xs"
                    color="grape"
                    onClick={() => handleStatusChange('REVIEW', task.id)}
                  >
                    Отправить на ревью
                  </Button>
                )}

                {(task.status === 'REVIEW' || task.status === 'TESTING') &&
                  (user?.role === 'TEAM_LEAD' ||
                    user?.role === 'TESTER' ||
                    user?.role === 'MANAGER') && (
                    <Group>
                      {task.status === 'REVIEW' && (
                        <Button
                          size="xs"
                          color="teal"
                          onClick={() => handleStatusChange('TESTING', task.id)}
                        >
                          Принять на тестирование
                        </Button>
                      )}
                      {task.status === 'TESTING' && (
                        <>
                          <Button
                            size="xs"
                            color="green"
                            onClick={() => handleStatusChange('DONE', task.id)}
                          >
                            Завершить
                          </Button>
                          <Button
                            size="xs"
                            color="orange"
                            onClick={() => handleStatusChange('REVIEW', task.id)}
                          >
                            Вернуть на ревью
                          </Button>
                        </>
                      )}
                      <Button
                        size="xs"
                        color="red"
                        onClick={() => handleStatusChange('IN_PROGRESS', task.id)}
                      >
                        Вернуть на доработку
                      </Button>
                    </Group>
                  )}
              </Group>
            </Group>
          </Paper>
        );
      })}
    </>
  );
};

export default Tasks;
