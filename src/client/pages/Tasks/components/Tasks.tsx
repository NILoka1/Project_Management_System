import { useEffect, useState } from "react";
import { Role, Task } from "../../../types";
import { tasksAPI } from "../../../services/api";
import {
  ActionIcon,
  Badge,
  Flex,
  Group,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { IconClock, IconEdit } from "@tabler/icons-react";
import { getStatusColor, getPriorityColor } from "../../../func/colors";
import { NewTask } from "../../../components/modal/newTask";
import { TaskTimer } from "../../../components/TaskTimer";

const Tasks = ({ role, solo }: { role: Role; solo: boolean }) => {
  const [tasks, setTasks] = useState<Task[]>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let response;
        if (solo) {
          response = await tasksAPI.getPersonalTask();
        } else {
          response = await tasksAPI.getAllTask();
        }

        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchData();
  }, []);
  if (!tasks) {
    return <div>Загрузка...</div>;
  }
  if (tasks.length === 0) {
    return <Text>Нет задач</Text>;
  }

  return (
    <>
      <Flex m={"md"}>
        {((!solo && role === "MANAGER") || role === "TEAM_LEAD") && <NewTask />}
      </Flex>

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
                  <TaskTimer taskId={task.id} taskTitle={task.title} />
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
        );
      })}
    </>
  );
};

export default Tasks;
