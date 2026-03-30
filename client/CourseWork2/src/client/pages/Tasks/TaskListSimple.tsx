import { ActionIcon, Badge, Group, Paper, Stack, Text } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import { getStatusColor } from '../../utils/colors';
import { Task, SafeUser } from '../../types';

export const TaskListSimple = ({ task, user }: { task: Task[]; user: SafeUser }) => {
  return (
    <>
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
                </Group>
              </Stack>
              <Group gap="xs">
                {(user.role === 'TEAM_LEAD' || user.role === 'MANAGER') && (
                  <ActionIcon variant="outline" color="blue" title="Редактировать задачу">
                    <IconEdit size={16}></IconEdit>
                  </ActionIcon>
                )}
              </Group>
            </Group>
          </Paper>
        );
      })}
    </>
  );
};
