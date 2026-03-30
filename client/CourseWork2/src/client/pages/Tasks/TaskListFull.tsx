import { ActionIcon, Badge, Group, Paper, Stack, Text, Flex } from '@mantine/core';
import { IconEdit, IconClock } from '@tabler/icons-react';
import { getStatusColor, getPriorityColor } from '../../utils/colors';
import { NewTask } from '../../components/modal/newTask';
import { TaskTimer } from '../../components/Tasks/TaskTimer';
import { Task, SafeUser, TaskStatus } from '../../types';
import { TaskAction } from '../../components/Tasks/TaskAction';

export const TaskListFull = ({
  task,
  user,
  handleStatusChange,
}: {
  task: Task[];
  user: SafeUser;
  handleStatusChange: (newStatus: TaskStatus, taskId: string) => Promise<void>;
}) => {
  return (
    <>
      <Flex m={'md'}>
        {(user?.role === 'MANAGER' || user?.role === 'TEAM_LEAD') && <NewTask />}
      </Flex>

      {task.map((task) => {
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
                {user.role === 'DEVELOPER' && task.assigneeId === user.id ? (
                  <Text>
                    <TaskTimer taskId={task.id} taskTitle={task.title} />
                  </Text>
                ) : (
                  <ActionIcon variant="outline" color="blue" title="Редактировать задачу">
                    <IconEdit size={16}></IconEdit>
                  </ActionIcon>
                )}

                <TaskAction task={task} user={user} handleStatusChange={handleStatusChange} />
              </Group>
            </Group>
          </Paper>
        );
      })}
    </>
  );
};
