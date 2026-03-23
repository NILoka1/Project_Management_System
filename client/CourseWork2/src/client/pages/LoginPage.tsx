
import { Container, Title, Text, Stack } from '@mantine/core';
import { JSX } from 'react';

export function LoginPage() :JSX.Element {
  return (
    <Container size="sm">
      <Stack gap="lg">
        <Title order={1}>Вход в систему</Title>
        <Text>Страница входа (будет реализована позже)</Text>
      </Stack>
    </Container>
  );
}