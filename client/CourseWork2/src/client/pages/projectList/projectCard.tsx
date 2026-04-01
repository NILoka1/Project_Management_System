import { Card, Text, Group, Progress, Button } from '@mantine/core';
export function ProjectCard({ project, navigate }) {
  return (
    <Card key={project.id} shadow="sm" padding="lg" withBorder>
      <Group justify="space-between" mb="xs">
        <Button
          onClick={() => {
            navigate(`/project/${project.id}`);
          }}
          variant="light"
          ta={'left'}
          color="rgba(0, 0, 0, 1)"
        >
          <Text size="md">{project.name}</Text>
        </Button>
        <Text size="sm" c="dimmed">
          {project.status}
        </Text>
      </Group>

      <Text ml={'lg'} size="sm" c="dimmed" mb="md">
        {project.description}
      </Text>

      <Progress ml={'lg'} value={project.progress} size="lg" />
      <Text size="sm" ta="center" mt="xs">
        {project.progress}% завершено
      </Text>
    </Card>
  );
}
