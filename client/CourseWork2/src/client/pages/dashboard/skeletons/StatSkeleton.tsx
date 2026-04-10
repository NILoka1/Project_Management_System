import { Paper, SimpleGrid, Text, Skeleton, Flex, Group, Stack } from '@mantine/core';
import { IconClock, IconCheck, IconProgress, IconFolder } from '@tabler/icons-react';

export const StatsSkeleton = () => {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
      <Paper p="md" withBorder>
        <Flex align={'center'} justify="space-between" mb="xs">
          <Text size="sm" fw={500}>
            Продуктивность
          </Text>
          <Skeleton h={20} w={'15%'} radius={'xl'} />
        </Flex>
        <Skeleton h={12} />
        <Skeleton h={14} mt={5} />
      </Paper>
      <Paper p="md" withBorder>
        <Group>
          <IconClock size={24} color="var(--mantine-color-blue-6)" />
          <div>
            <Text size="sm" fw={500}>
              Время
            </Text>
            <Skeleton h={29} w={150} />
            <Skeleton h={17} w={100} mt={1} />
          </div>
        </Group>
      </Paper>
      <Paper p="md" withBorder>
        <Stack gap="xs">
          <Group>
            <IconCheck size={20} color="var(--mantine-color-green-6)" />
            <Flex gap={'md'}>
              <Text size="sm">Выполнено:</Text>
              <Skeleton h={20} w={30} />
            </Flex>
          </Group>
          <Group>
            <IconProgress size={20} color="var(--mantine-color-blue-6)" />
            <Flex gap={'md'}>
              <Text size="sm">В работе:</Text>
              <Skeleton h={20} w={30} />
            </Flex>
          </Group>
        </Stack>
      </Paper>
      <Paper p="md" withBorder>
        <Group>
          <IconFolder size={24} color="var(--mantine-color-violet-6)" />
          <div>
            <Text size="sm" fw={500}>
              Проекты
            </Text>
            <Skeleton h={29} w={40} />
            <Skeleton h={17} w={100} mt={1} />
          </div>
        </Group>
      </Paper>
    </SimpleGrid>
  );
};
