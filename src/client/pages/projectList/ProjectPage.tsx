import { JSX } from 'react';
import { Card, Text, Stack, Container, Title } from '@mantine/core';
import { useAuthStore } from '../../store/authStore';
import { NewProject } from '../../components/modal/newProject';
import { useNavigate } from 'react-router-dom';
import { useProject } from './useProjects';
import { ProjectCard } from './projectCard';

export function ProjectList(): JSX.Element {
  const { user } = useAuthStore();
  const role = user?.role;
  const navigate = useNavigate();
  const { projects, setProjects, loading, error } = useProject();

  if (error) {
    return (
      <Container>
        <Text>Неизвестная ошибка</Text>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Text>Загрузка проектов...</Text>
      </Container>
    );
  }

  return (
    <>
      <Stack gap="md">
        <Title order={2}>Проекты</Title>

        {role === 'MANAGER' && (
          <>
            <NewProject project={projects} setProjects={setProjects} />
          </>
        )}

        {projects.map((project) => (
          <ProjectCard project={project} navigate={navigate}/>
        ))}

        {projects.length === 0 && (
          <Card>
            <Text>Проекты не найдены. Добавьте первый проект!</Text>
          </Card>
        )}
      </Stack>
    </>
  );
}
