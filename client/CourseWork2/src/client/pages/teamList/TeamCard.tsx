import { Card, Text, Group, Button } from '@mantine/core';
export function TeamCard({ team, navigate }) {
  return (
    <Card key={team.id} shadow="sm" padding="lg" withBorder>
      <Group justify="space-between" mb="xs">
        <Button
          onClick={() => {
            navigate(`/team/${team.id}`);
          }}
          fw={'15px'}
          variant="light"
          ta={'left'}
          color="rgba(0, 0, 0, 1)"
        >
          <Text size="md" mb="md">
            {team.name}
          </Text>
        </Button>
      </Group>

      <Text ml={'lg'} size="sm" c="dimmed" mb="md">
        {team.description}
      </Text>

      <Text ml={'lg'} size="sm" c="dimmed" mb="md">
        {new Date(team.createdAt).toLocaleDateString()}
      </Text>
    </Card>
  );
}
