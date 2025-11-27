// components/AddProjectsModal.tsx
import {
  Button,
  Modal,
  TextInput,
  Stack,
  Checkbox,
  Group,
  Text,
  Paper,
  Badge,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { ProjectAPI } from "../../services/api";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  progress: number;
}

interface AddProjectsModalProps {
  onProjectsAdd: (projectIds: string[]) => void;
  existingProjects?: string[]; // ID уже существующих проектов
}

export const AddProjectsModal = ({
  onProjectsAdd,
  existingProjects = [],
}: AddProjectsModalProps) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Загрузка проектов
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        // Замените на ваш реальный API вызов
        const response = await ProjectAPI.getProjects();
        setProjects(response.data);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    };

    if (opened) {
      fetchProjects();
    }
  }, [opened]);

  // Фильтрация проектов
  const filteredProjects = projects.filter(
    (project) =>
      (project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())) &&
      !existingProjects.includes(project.id) // Исключаем уже добавленные проекты
  );

  const handleProjectToggle = (projectId: string) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleAddProjects = () => {
    onProjectsAdd(selectedProjects);
    setSelectedProjects([]);
    setSearchQuery("");
    close();
  };

  const handleClose = () => {
    setSelectedProjects([]);
    setSearchQuery("");
    close();
  };

  const getStatusLabel = (status: string) => {
    const statusLabels = {
      PLANNING: "Планирование",
      ACTIVE: "Активный",
      ON_HOLD: "На паузе",
      COMPLETED: "Завершен",
      CANCELLED: "Отменен",
    };
    return statusLabels[status as keyof typeof statusLabels] || status;
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      PLANNING: "blue",
      ACTIVE: "green",
      ON_HOLD: "yellow",
      COMPLETED: "gray",
      CANCELLED: "red",
    };
    return statusColors[status as keyof typeof statusColors] || "gray";
  };

  return (
    <>
      <Button
        leftSection={<IconPlus size={16} />}
        onClick={open}
        variant="light"
        color="blue"
      >
        Добавить проекты
      </Button>

      <Modal
        opened={opened}
        onClose={handleClose}
        title="Добавить проекты в команду"
        size="lg"
      >
        <Stack>
          {/* Поиск */}
          <TextInput
            placeholder="Поиск по названию или описанию..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
            leftSection={<IconSearch size={16} />}
          />

          {/* Список проектов */}
          <Stack gap="sm" style={{ maxHeight: 400, overflowY: "auto" }}>
            {loading ? (
              <Text c="dimmed" ta="center">
                Загрузка...
              </Text>
            ) : filteredProjects.length === 0 ? (
              <Text c="dimmed" ta="center">
                {searchQuery ? "Проекты не найдены" : "Нет доступных проектов"}
              </Text>
            ) : (
              filteredProjects.map((project) => (
                <Paper key={project.id} p="md" withBorder>
                  <Group justify="space-between">
                    <Group>
                      <Checkbox
                        checked={selectedProjects.includes(project.id)}
                        onChange={() => handleProjectToggle(project.id)}
                      />
                      <div>
                        <Text fw={500}>{project.name}</Text>
                        <Text size="sm" c="dimmed" lineClamp={1}>
                          {project.description}
                        </Text>
                        <Group gap="xs" mt={4}>
                          <Badge
                            size="sm"
                            color={getStatusColor(project.status)}
                            variant="light"
                          >
                            {getStatusLabel(project.status)}
                          </Badge>
                          <Badge size="sm" variant="outline">
                            Прогресс: {project.progress}%
                          </Badge>
                        </Group>
                      </div>
                    </Group>
                  </Group>
                </Paper>
              ))
            )}
          </Stack>

          {/* Кнопки действий */}
          <Group justify="space-between" mt="md">
            <Text size="sm" c="dimmed">
              Выбрано: {selectedProjects.length}
            </Text>
            <Group>
              <Button variant="outline" onClick={handleClose}>
                Отмена
              </Button>
              <Button
                onClick={handleAddProjects}
                disabled={selectedProjects.length === 0}
                color="blue"
              >
                Добавить выбранные
              </Button>
            </Group>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
