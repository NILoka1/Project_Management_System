import {
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { CreateTaskRequest, Project } from "../../types";
import { DateInput } from "@mantine/dates";
import { ProjectAPI, tasksAPI } from "../../services/api";
import { useEffect, useState } from "react";



export const NewTask = () => {
  const [modal, { open, close }] = useDisclosure(false);
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => {
    // Загружаем проекты при открытии модалки
    if (modal) {
      fetchProjects();
    }
  }, [modal]);

  const fetchProjects = async () => {
    try {
      const response = await ProjectAPI.getProjects();
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const form = useForm<CreateTaskRequest>({
    initialValues: {
      title: "",
      description: "",
      dueDate: undefined,
      projectId: "",
    },
    validate: {
      title: (value) =>
        value.trim().length < 2
          ? "Название должно содержать минимум 2 символа"
          : null,
      description: (value) =>
        value.trim().length < 5
          ? "Описание должно содержать минимум 5 символов"
          : null,
      projectId: (value) => (!value ? "Выберите проект" : null),
    },
  });

  const handleSubmit = async (values: CreateTaskRequest) => {
    try {
      const res = (await tasksAPI.createTask(values)).data;
      console.log(res);
      form.reset();
      close();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  return (
    <>
      <Button fullWidth onClick={open}>Создать задачу</Button>
      <Modal opened={modal} onClose={close} title="Создать задачу" size="lg">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap={"md"}>
            <TextInput
              label="Название задачи"
              placeholder="Введите название задачи"
              required
              {...form.getInputProps("title")}
            />

            <Textarea
              label="Описание"
              placeholder="Опишите задачу"
              minRows={3}
              required
              {...form.getInputProps("description")}
            />

            <Select
              label="Проект"
              placeholder="Выберите проект"
              data={projects.map((project) => ({
                value: project.id,
                label: project.name,
              }))}
              required
              {...form.getInputProps("projectId")}
            />

            <DateInput
              label="Срок выполнения"
              placeholder="Выберите дату"
              valueFormat="DD.MM.YYYY"
              minDate={new Date()}
              clearable
              {...form.getInputProps("dueDate")}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={close}>
                Отмена
              </Button>
              <Button type="submit">Создать задачу</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
};
