import { useEffect, useState } from 'react';
import { User } from '../../types/index';
import { UsersAPI } from '../../services/api';
import { useStatePage } from '../../StatePage/useStatePage';
export const useUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { error, setError, loading, setLoading } = useStatePage();

  useEffect(() => {
    const getUser = async () => {
      try {
        setUsers((await UsersAPI.getUsers()).data);
      } catch {
        setError('ошибка загрузки пользователей');
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, []);

  const handleUpdate = (userId: string, newRole: User['role']) => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)));
    UsersAPI.updateUserRole(userId, newRole);
  };

  const handleDelete = (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId));
    // Здесь будет вызов API для удаления пользователя
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  return { filteredUsers, searchQuery, setSearchQuery, error, loading, handleUpdate, handleDelete };
};
