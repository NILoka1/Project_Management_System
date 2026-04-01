import { useUniversalTask } from './useUniversalTask';
import { Text } from '@mantine/core';
import { TaskListSimple } from './TaskListSimple';
import { TaskListFull } from './TaskListFull';
import { StatePage } from '../../StatePage/StatePage';
import { TaskSkeleton } from './TaskSkeleton';

export const UniversalTasks = ({ type }: { type: 'all' | 'solo' | 'done' | 'backlog' }) => {
  const data = useUniversalTask({ type });
  
  return (
    <StatePage error={data.error} loading={data.loading} Skeleton={<TaskSkeleton />}>
      {type === 'done' || type === 'backlog' ? (
        <TaskListSimple {...data} />
      ) : (
        <TaskListFull {...data} />
      )}
    </StatePage>
  );
};
