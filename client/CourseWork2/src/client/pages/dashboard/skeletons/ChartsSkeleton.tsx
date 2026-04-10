// components/DeveloperCharts.tsx
import {
  Paper,
  Title,
  Text,
  Stack,
  Group,
  Progress,
  Badge,
  Alert,
  Button,
  Card,
  SimpleGrid,
  Flex,
  Skeleton,
} from '@mantine/core';
import { IconRefresh, IconCheck, IconClock, IconList } from '@tabler/icons-react';
import { useCharts } from '../hooks/useCharts';
import { StatePage } from '../../../StatePage/StatePage';

export const ChartsSkeleton = () => {
  return (
    <Paper p="md" withBorder>
      <Group justify="space-between" mb="md">
        <Title order={3}>Статистика за неделю</Title>
        <Skeleton h={30} w={105} />
      </Group>
      <Stack>
        <Card withBorder>
          <Group justify="space-between" mb="md">
            <Text fw={500}>Общая продуктивность</Text>
            <Skeleton h={26} w={45} radius={'xl'}></Skeleton>
            <Skeleton h={12} radius={'xl'}></Skeleton>
            <SimpleGrid cols={3}>
              <Flex direction={'column'} gap="xs">
                <IconCheck size={16} color="var(--mantine-color-green-6)" />
                <div>
                  <Skeleton h={20} />
                  <Text size="xs" c="dimmed">
                    Выполнено
                  </Text>
                </div>
              </Flex>
              <Flex direction={'column'} gap="xs">
                <IconCheck size={16} color="var(--mantine-color-green-6)" />
                <div>
                  <Skeleton h={20} />
                  <Text size="xs" c="dimmed">
                    В работе
                  </Text>
                </div>
              </Flex>
              <Flex direction={'column'} gap="xs">
                <IconCheck size={16} color="var(--mantine-color-green-6)" />
                <div>
                  <Skeleton h={20} />
                  <Text size="xs" c="dimmed">
                    Всего
                  </Text>
                </div>
              </Flex>
            </SimpleGrid>
          </Group>
        </Card>
        <Card withBorder>
          <Group justify="space-between" mb="md">
            <Text fw={500}>Статусы задач</Text>
            <Skeleton h={18} w={48} radius={'xl'} />
          </Group>
          <Stack gap="xs">
            <Skeleton h={20} radius={'xl'} />
            <Skeleton h={20} radius={'xl'} />
          </Stack>
        </Card>
      </Stack>
    </Paper>
  );
};
