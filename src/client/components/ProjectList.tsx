import { useEffect, useState } from 'react';
import { Card, Text, Group, Progress, Stack, Container, Title } from '@mantine/core';
import { Project } from '../types';

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);


  if (loading) {
    return (
      <Container>
        <Text>Загрузка проектов...</Text>
      </Container>
    );
  }

  return (
    <Stack gap="md">
      <Title order={2}>Проекты</Title>
      
      {projects.map((project) => (
        <Card key={project.id} shadow="sm" padding="lg" withBorder>
          <Group justify="space-between" mb="xs">
            <Text fw={500}>{project.name}</Text>
            <Text size="sm" c="dimmed">
              {project.status}
            </Text>
          </Group>
          
          <Text size="sm" c="dimmed" mb="md">
            {project.description}
          </Text>
          
          <Progress value={project.progress} size="lg" />
          <Text size="sm" ta="center" mt="xs">
            {project.progress}% завершено
          </Text>
        </Card>
      ))}
      
      {projects.length === 0 && (
        <Card>
          <Text>Проекты не найдены. Добавьте первый проект!</Text>
        </Card>
      )}
    </Stack>
  );
}