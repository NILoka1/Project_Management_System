import { Paper, Skeleton, Stack, Title } from '@mantine/core';

export const ProjectSkeleton = () => {
  return (
    <Paper p="md" withBorder>
      <Title order={3} mb="md">
        Наши проекты
      </Title>
      <Stack gap={'md'}>
        {[...Array(3)].map((_, i) => (
          <Paper key={i} p="sm" withBorder>
            <Stack gap="xs">
              <Skeleton h={20} w={'10%'} radius={'xl'} />
              <Skeleton h={25} w={'25%'} />
              <Skeleton h={20} w={'25%'} />
              <Skeleton h={32} />
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Paper>
  );
};
