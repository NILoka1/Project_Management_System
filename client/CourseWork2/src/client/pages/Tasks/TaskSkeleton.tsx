import { Group, Paper, Skeleton, Stack } from '@mantine/core';

export const TaskSkeleton = () => {
  return (
    <>
      <Skeleton h={34} m={'md'} />

      {[...Array(5)].map((_, i) => (
        <Paper key={i} p="sm" withBorder>
          <Group justify="space-between">
            <Stack gap={4} style={{ flex: 1 }}>
              <Skeleton h={25} w={'50%'} />
              <Skeleton h={20} w={'30%'} />
              <Skeleton h={20} w={'40%'} />
            </Stack>
          </Group>
        </Paper>
      ))}
    </>
  );
};
