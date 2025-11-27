import { useEffect, useState } from "react";
import {
  Card,
  Text,
  Group,
  Progress,
  Stack,
  Container,
  Title,
  Button,
} from "@mantine/core";
import { Project } from "../types";
import { ProjectAPI } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { NewProject } from "../components/modal/newProject";
import { useNavigate } from "react-router-dom";

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const role = user?.role;
  const navigate = useNavigate();

  useEffect(() => {
    const getData = async () => {
      setProjects((await ProjectAPI.getProjects()).data);
      setLoading(false);
    };
    getData();
  }, []);

  if (loading) {
    return (
      <Container>
        <Text>Загрузка проектов...</Text>
      </Container>
    );
  }

  return (
    <>
      <Stack gap="md">
        <Title order={2}>Проекты</Title>

        {role === "MANAGER" && (
          <>
            <NewProject project={projects} setProjects={setProjects} />
          </>
        )}

        {projects.map((project) => (
          <Card key={project.id} shadow="sm" padding="lg" withBorder>
            <Group justify="space-between" mb="xs">
              <Button
                onClick={() => {
                  navigate(`/project/${project.id}`);
                }}
                variant="light"
                ta={"left"}
                color="rgba(0, 0, 0, 1)"
              >
                {" "}
                <Text size="md" >
                  {project.name}
                </Text>
              </Button>
              <Text size="sm" c="dimmed">
                {project.status}
              </Text>
            </Group>

            <Text ml={"lg"} size="sm" c="dimmed" mb="md">
              {project.description}
            </Text>

            <Progress ml={"lg"} value={project.progress} size="lg" />
            <Text size="sm" ta="center" mt="xs">
              {project.progress}% завершено
            </Text>
          </Card>
        ))}

        {projects.length === 0 && (
          <Card>
            <Text>Проекты не найдены. Добавьте первый проект!</Text>
          </Card>
        )}
      </Stack>
    </>
  );
}
