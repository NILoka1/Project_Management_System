import { useUniversalTask } from './useUniversalTask';
import {Text} from '@mantine/core';
import { TaskListSimple } from './TaskListSimple';
import { TaskListFull } from './TaskListFull';

export const UniversalTasks = ({ type }: { type: 'all' | 'solo' | 'done' | 'backlog' }) => {
  const data = useUniversalTask({ type });
  if (data.loading) {
    return <Text>Загрузка...</Text>;
  }
  if (data.error) {
    return <Text>{data.error}</Text>;
  }
  if (data.task.length === 0) {
    return <Text>Нет задач</Text>;
  }

  if (type === 'done' || type === 'backlog') {
    return <TaskListSimple {...data} />;
  }
  return <TaskListFull {...data} />;
};
