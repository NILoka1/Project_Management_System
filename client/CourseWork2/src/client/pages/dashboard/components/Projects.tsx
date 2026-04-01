import { Paper, Title, Stack, Group, Text, Progress, Badge } from '@mantine/core';
import { useProject } from '../hooks/useProject';
import { StatePage } from '../../../StatePage/StatePage';
import { ProjectSkeleton } from '../skeletons/ProjectSkeleton';

export function Projects() {
  const { activeProjects, getStatusColor, error, loading } = useProject();

  return (
    <StatePage error={error} loading={loading} Skeleton={<ProjectSkeleton/>}>
      <Paper p="md" withBorder>
        <Title order={3} mb="md">
          Наши проекты
        </Title>

        <Stack gap="md">
          {activeProjects.map((project) => (
            <Paper key={project.id} p="sm" withBorder>
              <Stack gap="xs">
                <Badge color={getStatusColor(project.status)}>{project.status}</Badge>
                <Text fw={500}>{project.name}</Text>
                {project.description && (
                  <Text size="sm" c="dimmed" lineClamp={2}>
                    {project.description}
                  </Text>
                )}

                <Stack gap={4}>
                  <Group justify="space-between">
                    <Text size="sm">Прогресс</Text>
                    <Text size="sm" fw={500}>
                      {project.progress}%
                    </Text>
                  </Group>
                  <Progress value={project.progress} size="md" />
                </Stack>
              </Stack>
            </Paper>
          ))}

          {activeProjects.length === 0 && (
            <Text c="dimmed" ta="center" py="md">
              Нет активных проектов
            </Text>
          )}
        </Stack>
      </Paper>
    </StatePage>
  );
}
