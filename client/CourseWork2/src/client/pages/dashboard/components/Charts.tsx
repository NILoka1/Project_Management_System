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
} from '@mantine/core';
import { IconRefresh, IconCheck, IconClock, IconList } from '@tabler/icons-react';
import { useCharts } from '../hooks/useCharts';
import { StatePage } from '../../../StatePage/StatePage';
import { ChartsSkeleton } from '../skeletons/ChartsSkeleton';

export function Charts() {
  const { productivityData, timeStats, loadData, error, loading } = useCharts();
  return (
    <StatePage error={error} loading={loading} Skeleton={<ChartsSkeleton />}>
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={3}>Статистика за неделю</Title>
          <Button
            variant="outline"
            size="xs"
            onClick={loadData}
            leftSection={<IconRefresh size={14} />}
          >
            Обновить
          </Button>
        </Group>

        <Stack gap="lg">
          {/* Общая продуктивность */}
          <Card withBorder>
            <Group justify="space-between" mb="md">
              <Text fw={500}>Общая продуктивность</Text>
              {productivityData ? (
                <Badge
                  color={
                    productivityData.productivity >= 80
                      ? 'green'
                      : productivityData.productivity >= 60
                        ? 'yellow'
                        : 'red'
                  }
                  size="lg"
                >
                  {productivityData.productivity}%
                </Badge>
              ) : (
                <Badge color="gray" size="lg">
                  0%
                </Badge>
              )}
            </Group>

            {productivityData ? (
              <>
                <Progress
                  value={productivityData.productivity}
                  size="lg"
                  color={
                    productivityData.productivity >= 80
                      ? 'green'
                      : productivityData.productivity >= 60
                        ? 'yellow'
                        : 'red'
                  }
                  mb="md"
                />

                <SimpleGrid cols={3}>
                  <Flex direction={'column'} gap="xs">
                    <IconCheck size={16} color="var(--mantine-color-green-6)" />
                    <div>
                      <Text size="sm" fw={500}>
                        {productivityData.completedTasks}
                      </Text>
                      <Text size="xs" c="dimmed">
                        Выполнено
                      </Text>
                    </div>
                  </Flex>
                  <Flex direction={'column'} gap="xs">
                    <IconClock size={16} color="var(--mantine-color-yellow-6)" />
                    <div>
                      <Text size="sm" fw={500}>
                        {productivityData.pendingTasks}
                      </Text>
                      <Text size="xs" c="dimmed">
                        В работе
                      </Text>
                    </div>
                  </Flex>
                  <Flex direction={'column'} gap="xs">
                    <IconList size={16} color="var(--mantine-color-blue-6)" />
                    <div>
                      <Text size="sm" fw={500}>
                        {productivityData.totalTasks}
                      </Text>
                      <Text size="xs" c="dimmed">
                        Всего
                      </Text>
                    </div>
                  </Flex>
                </SimpleGrid>
              </>
            ) : (
              <Alert color="orange">Данные о продуктивности не загружены</Alert>
            )}
          </Card>

          {/* Распределение по статусам */}
          <Card withBorder>
            <Group justify="space-between" mb="md">
              <Text fw={500}>Статусы задач</Text>
              {timeStats ? (
                <Badge variant="light">Всего: {timeStats.totalTasks}</Badge>
              ) : (
                <Badge variant="light">Всего: 0</Badge>
              )}
            </Group>

            {timeStats && timeStats.distribution && timeStats.distribution.length > 0 ? (
              <Stack gap="xs">
                {timeStats.distribution.map((item) => (
                  <Group key={item.category} justify="space-between">
                    <Group gap="xs">
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: `var(--mantine-color-${item.color}-6)`,
                        }}
                      />
                      <Text size="sm">{item.category}</Text>
                    </Group>
                    <Group gap="xs">
                      <Text size="sm" fw={500}>
                        {item.value}%
                      </Text>
                      <Text size="sm" c="dimmed">
                        ({item.count})
                      </Text>
                    </Group>
                  </Group>
                ))}
              </Stack>
            ) : (
              <Alert color="blue">Нет задач за последнюю неделю</Alert>
            )}
          </Card>
        </Stack>
      </Paper>
    </StatePage>
  );
}
