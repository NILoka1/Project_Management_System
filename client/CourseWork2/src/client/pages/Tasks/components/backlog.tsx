import { useEffect, useState } from "react";
import { Role, Task } from "../../../types";
import { tasksAPI } from "../../../services/api";
import { ActionIcon, Badge, Group, Paper, Stack, Text } from "@mantine/core";
import {IconEdit } from "@tabler/icons-react";
import { getStatusColor } from "../../../func/colors";

const BacklogTasks = ({ role }: { role: Role }) => {
  const [tasks, setTasks] = useState<Task[]>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await tasksAPI.getBacklogTask();
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchData();
  }, []);
  if (!tasks) {
    return <Text>Загрузка...</Text>;
  }
  if (tasks.length === 0) {
    return <Text>Нет задач</Text>;
  }

  return (
    <>
      {tasks.map((task) => {
        return (
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
                </Group>
              </Stack>
              <Group gap="xs">
                {(role === "TEAM_LEAD" || role === "MANAGER") && (
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
        );
      })}
    </>
  );
};

export default BacklogTasks;
