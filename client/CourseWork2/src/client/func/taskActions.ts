import { Task, TaskStatus, Role, SafeUser } from '../types';

export interface ActionButton {
  label: string;
  color: string;
  action: () => void;
}

export const getTaskActions = (
  task: Task,
  user: SafeUser,
  handleStatusChange: (status: TaskStatus, taskId: string) => void,
): ActionButton[] => {
  const actions: ActionButton[] = [];

  // Только для определенных ролей
  const allowedRoles: Role[] = ['TEAM_LEAD', 'TESTER', 'MANAGER'];

  if (allowedRoles.includes(user.role)) {
    if (task.status === 'REVIEW') {
      actions.push({
        label: 'Отправить на тестирование',
        color: 'teal',
        action: () => handleStatusChange('TESTING', task.id),
      });
    }

    if (task.status === 'TESTING') {
      actions.push(
        {
          label: 'Завершить',
          color: 'green',
          action: () => handleStatusChange('DONE', task.id),
        },
        {
          label: 'Вернуть на ревью',
          color: 'orange',
          action: () => handleStatusChange('REVIEW', task.id),
        },
      );
    }

    // Общая кнопка "Вернуть на доработку"
    if (['REVIEW', 'TESTING'].includes(task.status)) {
      actions.push({
        label: 'Вернуть на доработку',
        color: 'red',
        action: () => handleStatusChange('IN_PROGRESS', task.id),
      });
    }
  }

  if (user.role === 'DEVELOPER' && task.assigneeId === user.id) {
    if (task.status === 'TODO') {
      actions.push({
        label: 'Взять в работу',
        color: 'blue',
        action: () => handleStatusChange('IN_PROGRESS', task.id),
      });
    }
    if (task.status === 'IN_PROGRESS') {
      actions.push({
        label: 'Отправить на ревью',
        color: 'grape',
        action: () => handleStatusChange('REVIEW', task.id),
      });
    }
  }
  return actions;
};
