import { Stack, Text, TextInput, Table, Select, ActionIcon, Group } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { User } from '../../types/index';
import { useUsersPage } from './useUsersPage';
import { StatePage } from '../../StatePage/StatePage';
export const Users = () => {
  const { filteredUsers, searchQuery, setSearchQuery, error, loading, handleUpdate, handleDelete } =
    useUsersPage();

  return (
    <StatePage error={error} loading={loading}>
      <Stack p="md">
        <Text size="xl" fw={500}>
          Пользователи
        </Text>

        {/* Строка поиска */}
        <TextInput
          placeholder="Поиск по имени или email..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.currentTarget.value)}
        />

        {/* Таблица пользователей */}
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Имя</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Роль</Table.Th>
              <Table.Th>Действия</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredUsers.map((user) => (
              <Table.Tr key={user.id}>
                <Table.Td>{user.name}</Table.Td>
                <Table.Td>{user.email}</Table.Td>
                <Table.Td>
                  <Select
                    value={user.role}
                    onChange={(value) => handleUpdate(user.id, value as User['role'])}
                    data={[
                      { value: 'MANAGER', label: 'Менеджер' },
                      { value: 'TEAM_LEAD', label: 'Team Lead' },
                      { value: 'DEVELOPER', label: 'Разработчик' },
                      { value: 'TESTER', label: 'Тестировщик' },
                    ]}
                    size="xs"
                  />
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon color="red" variant="subtle" onClick={() => handleDelete(user.id)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {filteredUsers.length === 0 && (
          <Text c="dimmed" ta="center" py="xl">
            Пользователи не найдены
          </Text>
        )}
      </Stack>
    </StatePage>
  );
};
