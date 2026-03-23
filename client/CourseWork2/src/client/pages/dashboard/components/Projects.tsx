import { useEffect, useState } from "react";
import {
  Paper,
  Title,
  Stack,
  Group,
  Text,
  Progress,
  Badge,
} from "@mantine/core";
import { dashboardAPI } from "../../../services/api";
import { Project } from "../../../types";

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await dashboardAPI.getUserProjects();
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const getStatusColor = (status: Project["status"]) => {
    const colors = {
      PLANNING: "gray",
      ACTIVE: "blue",
      ON_HOLD: "yellow",
      COMPLETED: "green",
      CANCELLED: "red",
    };
    return colors[status];
  };

  const activeProjects = projects
    .filter((p) => p.status === "ACTIVE")
    .slice(0, 3);

  return (
    <Paper p="md" withBorder>
      <Title order={3} mb="md">
        Наши проекты
      </Title>

      <Stack gap="md">
        {activeProjects.map((project) => (
          <Paper key={project.id} p="sm" withBorder>
            <Stack gap="xs">
              <Badge color={getStatusColor(project.status)}>
                {project.status}
              </Badge>
              <Text fw={500}>{project.name}</Text>
              {project.description && (
                <Text size="sm" c="dimmed" lineClamp={2}>
                  {project.description}
                </Text>
              )}

              <Stack gap={4}>
                <Group justify="space-between">
                  <Text size="sm">Прогресс</Text>
                  <Text size="sm" fw={500}>
                    {project.progress}%
                  </Text>
                </Group>
                <Progress value={project.progress} size="md" />
              </Stack>
            </Stack>
          </Paper>
        ))}

        {activeProjects.length === 0 && (
          <Text c="dimmed" ta="center" py="md">
            Нет активных проектов
          </Text>
        )}
      </Stack>
    </Paper>
  );
}
