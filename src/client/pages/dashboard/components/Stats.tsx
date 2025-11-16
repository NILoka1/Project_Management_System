// components/DashboardStats.tsx
import { useEffect, useState } from "react";
import {
  Group,
  Paper,
  Text,
  Progress,
  Badge,
  Stack,
  SimpleGrid,
} from "@mantine/core";
import {
  IconClock,
  IconCheck,
  IconProgress,
  IconAlertCircle,
  IconFolder,
} from "@tabler/icons-react";
import type { DashboardStats } from "../../../types";
import { dashboardAPI } from "../../../services/api";

export function Stats() {
  const [stats, setStats] = useState<DashboardStats>();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  if (!stats) {
    return <></>;
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
      {/* Продуктивность */}
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="xs">
          <Text size="sm" fw={500}>
            Продуктивность
          </Text>
          <Badge
            color={
              stats.productivity >= 80
                ? "green"
                : stats.productivity >= 60
                ? "yellow"
                : "red"
            }
          >
            {stats.productivity}%
          </Badge>
        </Group>
        <Progress
          value={stats.productivity}
          size="lg"
          color={
            stats.productivity >= 80
              ? "green"
              : stats.productivity >= 60
              ? "yellow"
              : "red"
          }
        />
        <Text size="xs" c="dimmed" mt={5}>
          Выполнено {stats.completedTasks} из {stats.totalTasks} задач
        </Text>
      </Paper>

      {/* Время */}
      <Paper p="md" withBorder>
        <Group>
          <IconClock size={24} color="var(--mantine-color-blue-6)" />
          <div>
            <Text size="sm" fw={500}>
              Время
            </Text>
            <Text size="lg" fw={700}>
              {stats.hoursToday}ч сегодня
            </Text>
            <Text size="xs" c="dimmed">
              {stats.hoursThisWeek}ч за неделю
            </Text>
          </div>
        </Group>
        {stats.activeTimer && (
          <Badge color="orange" variant="light" mt="xs">
            Активно: {stats.activeTimer}
          </Badge>
        )}
      </Paper>

      {/* Задачи */}
      <Paper p="md" withBorder>
        <Stack gap="xs">
          <Group>
            <IconCheck size={20} color="var(--mantine-color-green-6)" />
            <Text size="sm">Выполнено: {stats.completedTasks}</Text>
          </Group>
          <Group>
            <IconProgress size={20} color="var(--mantine-color-blue-6)" />
            <Text size="sm">В работе: {stats.inProgressTasks}</Text>
          </Group>
          {stats.overdueTasks > 0 && (
            <Group>
              <IconAlertCircle size={20} color="var(--mantine-color-red-6)" />
              <Text size="sm" c="red">
                Просрочено: {stats.overdueTasks}
              </Text>
            </Group>
          )}
        </Stack>
      </Paper>

      {/* Проекты */}
      <Paper p="md" withBorder>
        <Group>
          <IconFolder size={24} color="var(--mantine-color-violet-6)" />
          <div>
            <Text size="sm" fw={500}>
              Проекты
            </Text>
            <Text size="lg" fw={700}>
              {stats.projectsCount}
            </Text>
            <Text size="xs" c="dimmed">
              активных проектов
            </Text>
          </div>
        </Group>
      </Paper>
    </SimpleGrid>
  );
}
