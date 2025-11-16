// components/DeveloperCharts.tsx
import { useEffect, useState } from "react";
import {
  Paper,
  Title,
  Text,
  Stack,
  Group,
  Progress,
  Badge,
  Center,
  Loader,
  Alert,
  Button,
  Card,
  SimpleGrid,
} from "@mantine/core";
import { dashboardAPI } from "../../../services/api";
import { ProductivityData, TimeStats } from "../../../types";
import {
  IconAlertCircle,
  IconRefresh,
  IconCheck,
  IconClock,
  IconList,
} from "@tabler/icons-react";

export function Charts() {
  const [productivityData, setProductivityData] =
    useState<ProductivityData | null>(null);
  const [timeStats, setTimeStats] = useState<TimeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔄 Loading analytics data...");

      const [productivityResponse, timeResponse] = await Promise.all([
        dashboardAPI.getProductivityData("week"),
        dashboardAPI.getTimeStats("week"),
      ]);

      console.log("📊 Productivity response:", productivityResponse);
      console.log("⏱️ Time response:", timeResponse);

      // ✅ ПРАВИЛЬНОЕ ИЗВЛЕЧЕНИЕ ДАННЫХ
      // Используем any для обхода проверки типов, так как структура известна
      const productivityData = (productivityResponse as any)?.data?.data;
      const timeStats = (timeResponse as any)?.data?.data;

      if (productivityData) {
        setProductivityData(productivityData);
      } else {
        console.warn("❌ No productivity data in response");
        setProductivityData(null);
      }

      if (timeStats) {
        setTimeStats(timeStats);
      } else {
        console.warn("❌ No time stats data in response");
        setTimeStats(null);
      }
    } catch (err) {
      console.error("❌ Failed to load analytics data:", err);
      setError("Не удалось загрузить данные аналитики");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <Paper p="md" withBorder>
        <Center h={200}>
          <Loader />
        </Center>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper p="md" withBorder>
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Ошибка"
          color="red"
          mb="md"
        >
          {error}
        </Alert>
        <Button leftSection={<IconRefresh size={16} />} onClick={loadData}>
          Попробовать снова
        </Button>
      </Paper>
    );
  }

  return (
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
                    ? "green"
                    : productivityData.productivity >= 60
                    ? "yellow"
                    : "red"
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
                    ? "green"
                    : productivityData.productivity >= 60
                    ? "yellow"
                    : "red"
                }
                mb="md"
              />

              <SimpleGrid cols={3}>
                <Group gap="xs">
                  <IconCheck size={16} color="var(--mantine-color-green-6)" />
                  <div>
                    <Text size="sm" fw={500}>
                      {productivityData.completedTasks}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Выполнено
                    </Text>
                  </div>
                </Group>
                <Group gap="xs">
                  <IconClock size={16} color="var(--mantine-color-yellow-6)" />
                  <div>
                    <Text size="sm" fw={500}>
                      {productivityData.pendingTasks}
                    </Text>
                    <Text size="xs" c="dimmed">
                      В работе
                    </Text>
                  </div>
                </Group>
                <Group gap="xs">
                  <IconList size={16} color="var(--mantine-color-blue-6)" />
                  <div>
                    <Text size="sm" fw={500}>
                      {productivityData.totalTasks}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Всего
                    </Text>
                  </div>
                </Group>
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

          {timeStats &&
          timeStats.distribution &&
          timeStats.distribution.length > 0 ? (
            <Stack gap="xs">
              {timeStats.distribution.map((item) => (
                <Group key={item.category} justify="space-between">
                  <Group gap="xs">
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
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
  );
}
