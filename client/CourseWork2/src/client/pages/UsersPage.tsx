import {
  Stack,
  Text,
  TextInput,
  Table,
  Select,
  ActionIcon,
  Group,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { IconTrash } from "@tabler/icons-react";
import { useAuthStore } from "../store/authStore";
import { User } from "../types/index";
import { UsersAPI } from "../services/api";
export const Users = () => {
  const { user } = useAuthStore();
  const role = user?.role;

  if (role != "MANAGER") {
    return <Text>Доступ запрещён</Text>;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const getData = async () => {
        setUsers((await UsersAPI.getUsers()).data);
      };
      getData();
    };
    getUser();
  }, []);

  const handleUpdate = (userId: string, newRole: User["role"]) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
    UsersAPI.updateUserRole(userId, newRole);
  };

  const handleDelete = (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId));
    // Здесь будет вызов API для удаления пользователя
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
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
                  onChange={(value) =>
                    handleUpdate(user.id, value as User["role"])
                  }
                  data={[
                    { value: "MANAGER", label: "Менеджер" },
                    { value: "TEAM_LEAD", label: "Team Lead" },
                    { value: "DEVELOPER", label: "Разработчик" },
                    { value: "TESTER", label: "Тестировщик" },
                  ]}
                  size="xs"
                />
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() => handleDelete(user.id)}
                  >
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
  );
};
