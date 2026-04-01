import { Card, Center, Group, Skeleton, Stack, Title } from '@mantine/core';

export const ProjectSkeleton = () => {
  return (
    <Stack gap="md">
      <Title order={2}>Проекты</Title>
      <Skeleton h={36} />
      {[...Array(3)].map((_, i) => (
        <Card key={i} shadow="sm" padding="lg" withBorder>
          <Group justify="space-between" mb="xs">
            <Skeleton h={36} w={'20%'} />
            <Skeleton h={20} w={'10%'} />
          </Group>
          <Skeleton h={20} w={'30%'} mb="md" />
          <Skeleton h={12} ml={'lg'} mb={'xs'} />
          <Center>
            <Skeleton h={20} w={'15%'} />
          </Center>
        </Card>
      ))}
    </Stack>
  );
};
