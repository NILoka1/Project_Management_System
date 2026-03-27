import { JSX } from 'react';
import { getTaskActions } from '../func/taskActions';
import { SafeUser, Task, TaskStatus } from '../types';
import { Button, Group } from '@mantine/core';

export const TaskAction = ({
  task,
  user,
  handleStatusChange,
}: {
  task: Task;
  user: SafeUser;
  handleStatusChange: (status: TaskStatus, taskId: string) => void;
}): JSX.Element => {
  const action = getTaskActions(task, user, handleStatusChange);
  if (action.length === 0) return null;

  return (
    <Group>
      {action.map((a) => (
        <Button key={a.label} size="xs" color={a.color} onClick={a.action}>
          {a.label}
        </Button>
      ))}
    </Group>
  );
};
