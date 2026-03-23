
import { Container, Title, Text, Stack } from '@mantine/core';
import { useAuthStore } from '../store/authStore';
import { JSX } from 'react';

export function ProfilePage(): JSX.Element {
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