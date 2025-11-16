import { useEffect, useState } from "react";
import {
  Paper,
  Title,
  Stack,
  Group,
  Badge,
  Text,
  Button,
  ActionIcon,
} from "@mantine/core";
import { IconPlayerPlay, IconEdit, IconClock } from "@tabler/icons-react";
import { dashboardAPI } from "../../../services/api";
import { Task, Role } from "../../../types";

interface TasksProps {
  role: Role;
}

export function Tasks({role}: TasksProps) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await dashboardAPI.getUserTasks();
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    const colors = {
      BACKLOG: "gray",
      TODO: "blue",
      IN_PROGRESS: "yellow",
      REVIEW: "orange",
      TESTING: "violet",
      DONE: "green",
    };
    return colors[status];
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    const colors = {
      LOW: "gray",
      MEDIUM: "blue",
      HIGH: "orange",
      URGENT: "red",
    };
    return colors[priority];
  };

  const activeTasks = tasks
    .filter((task) => task.status === "IN_PROGRESS" || task.status === "TODO")
    .slice(0, 5); // Показываем только 5 активных задач

  return (
    <Paper p="md" withBorder>
      <Group justify="space-between" mb="md">
        <Title order={3}>Мои активные задачи</Title>
        <Button variant="light" size="xs">
          Все задачи
        </Button>
      </Group>

      <Stack gap="sm">
        {activeTasks.map((task) => (
          <Paper key={task.id} p="sm" withBorder>
            <Group justify="space-between">
              <Stack gap={4} style={{ flex: 1 }}>
                <Text fw={500}>{task.title || "Без названия"}</Text>
                {task.description && (
                  <Text size="sm" c="dimmed" lineClamp={1}>
                    {task.description}
                  </Text>
                )}

                <Group gap="xs">
                  <Badge color={getStatusColor(task.status)} size="sm">
                    {task.status}
                  </Badge>
                  <Badge color={getPriorityColor(task.priority)} size="sm">
                    {task.priority}
                  </Badge>
                  {task.dueDate && (
                    <Group gap={4}>
                      <IconClock size={14} />
                      <Text size="xs">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </Text>
                    </Group>
                  )}
                </Group>
              </Stack>

              <Group gap="xs">
                {role === "DEVELOPER" || role === "TESTER" ? (
                  <ActionIcon
                    variant="light"
                    color="blue"
                    title="Запустить таймер"
                  >
                    <IconPlayerPlay size={16} />
                  </ActionIcon>
                ) : (
                  <ActionIcon
                    variant="outline"
                    color="blue"
                    title="Редактировать задачу"
                  >
                    <IconEdit size={16}></IconEdit>
                  </ActionIcon>
                )}
              </Group>
            </Group>
          </Paper>
        ))}

        {activeTasks.length === 0 && (
          <Text c="dimmed" ta="center" py="md">
            Нет активных задач
          </Text>
        )}
      </Stack>
    </Paper>
  );
}
