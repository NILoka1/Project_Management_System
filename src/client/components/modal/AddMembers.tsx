// components/AddMembersModal.tsx
import { Button, Modal, TextInput, Stack, Checkbox, Group, Text, Avatar } from '@mantine/core';
import { useState, useEffect, JSX } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { SafeUser } from '../../types';
import { UsersAPI } from '../../services/api';

interface AddMembersModalProps {
  onMembersAdd: (userIds: string[]) => void;
  existingMembers?: string[]; // ID уже существующих участников
}

export const AddMembers = ({
  onMembersAdd,
  existingMembers = [],
}: AddMembersModalProps): JSX.Element => {
  const [opened, { open, close }] = useDisclosure(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Загрузка пользователей
  useEffect(() => {
    const fetchUsers = async (): Promise<void> => {
      setLoading(true);
      try {
        const response = await UsersAPI.getUsers();
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    if (opened) {
      fetchUsers();
    }
  }, [opened]);

  // Фильтрация пользователей
  const filteredUsers = users.filter(
    (user) =>
      (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
      !existingMembers.includes(user.id), // Исключаем уже добавленных участников
  );

  const handleUserToggle = (userId: string): void => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const handleAddMembers = (): void => {
    onMembersAdd(selectedUsers);
    setSelectedUsers([]);
    setSearchQuery('');
    close();
  };

  const handleClose = (): void => {
    setSelectedUsers([]);
    setSearchQuery('');
    close();
  };

  const getRoleLabel = (role: string): string => {
    const roles = {
      MANAGER: 'Менеджер',
      TEAM_LEAD: 'Team Lead',
      DEVELOPER: 'Разработчик',
      TESTER: 'Тестировщик',
    };
    return roles[role as keyof typeof roles] || role;
  };

  return (
    <>
      <Button leftSection={<IconPlus size={16} />} onClick={open} variant="light">
        Добавить участников
      </Button>

      <Modal opened={opened} onClose={handleClose} title="Добавить участников в команду" size="lg">
        <Stack>
          {/* Поиск */}
          <TextInput
            placeholder="Поиск по имени или email..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
            leftSection={<IconSearch size={16} />}
          />

          {/* Список пользователей */}
          <Stack gap="sm" style={{ maxHeight: 400, overflowY: 'auto' }}>
            {loading ? (
              <Text c="dimmed" ta="center">
                Загрузка...
              </Text>
            ) : filteredUsers.length === 0 ? (
              <Text c="dimmed" ta="center">
                {searchQuery ? 'Пользователи не найдены' : 'Нет доступных пользователей'}
              </Text>
            ) : (
              filteredUsers.map((user) => (
                <Group key={user.id} justify="space-between">
                  <Group>
                    <Avatar src={user.avatar} size="sm" radius="xl">
                      {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </Avatar>
                    <div>
                      <Text size="sm" fw={500}>
                        {user.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {user.email} • {getRoleLabel(user.role)}
                      </Text>
                    </div>
                  </Group>
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleUserToggle(user.id)}
                  />
                </Group>
              ))
            )}
          </Stack>

          {/* Кнопки действий */}
          <Group justify="space-between" mt="md">
            <Text size="sm" c="dimmed">
              Выбрано: {selectedUsers.length}
            </Text>
            <Group>
              <Button variant="outline" onClick={handleClose}>
                Отмена
              </Button>
              <Button onClick={handleAddMembers} disabled={selectedUsers.length === 0}>
                Добавить выбранных
              </Button>
            </Group>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
