import { Task } from '../types';

export const getStatusColor = (status: Task['status']): string => {
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

export const getPriorityColor = (priority: Task['priority']): string => {
  const colors = {
    LOW: 'gray',
    MEDIUM: 'blue',
    HIGH: 'orange',
    URGENT: 'red',
  };
  return colors[priority];
};
