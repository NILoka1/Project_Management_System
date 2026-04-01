import { Card,  Skeleton, Stack, Title } from '@mantine/core';

export const TeamSkeleton = () => {
  return (
    <Stack gap="md">
      <Title order={2}>Команды</Title>

      <Skeleton h={36} />

      {[...Array(4)].map((_, i) => (
        <Card key={i} shadow="sm" padding="lg" withBorder>
          <Skeleton h={36} w={90} mb="xs" />
          <Skeleton h={30} mb={'xs'} />
          <Skeleton h={30} />
        </Card>
      ))}
    </Stack>
  );
};
