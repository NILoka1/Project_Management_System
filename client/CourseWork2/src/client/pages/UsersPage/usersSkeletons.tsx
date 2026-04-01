import { Stack, Text, Table, Skeleton } from '@mantine/core';

export const UsersSkeletons = () => {
  return (
    <Stack p={'md'}>
      <Text size="xl" fw={500}>
        Пользователи
      </Text>
      <Skeleton h={36} />
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
          {[...Array(8)].map((_, i) => (
            <Table.Tr key={i}>
              <Table.Td>
                <Skeleton w={70} h={'16'} />
              </Table.Td>
              <Table.Td>
                <Skeleton w={126} h={'16'} />
              </Table.Td>
              <Table.Td>
                <Skeleton w={100} h={'16'} />
              </Table.Td>
              <Table.Td>
                <Skeleton w={100} h={'16'} />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
};
