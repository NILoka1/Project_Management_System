
import { Container, Title, Text, Stack } from '@mantine/core';
import { useAuthStore } from '../store/authStore';

export function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <Container size="sm">
      <Stack gap="lg">
        <Title order={1}>Профиль</Title>
        <Text>Имя: {user?.name}</Text>
        <Text>Email: {user?.email}</Text>
        <Text>Роль: {user?.role}</Text>
      </Stack>
    </Container>
  );
}