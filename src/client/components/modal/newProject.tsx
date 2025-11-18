import { useState } from "react";
import {
  Modal,
  TextInput,
  Textarea,
  NumberInput,
  Select,
  Button,
  Group,
  Stack,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { ProjectAPI } from "../../services/api";
import { CreateProjectRequest, Project } from "../../types";

export const NewProject = ({
  project,
  setProjects,
}: {
  project: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}) =>{
  const [modal, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateProjectRequest>({
    initialValues: {
      name: "",
      description: "",
      budget: undefined,
      startDate: undefined,
      endDate: undefined,
      status: "PLANNING",
    },
    validate: {
      name: (value) =>
        value.trim().length < 2
          ? "Название должно содержать минимум 2 символа"
          : null,
      description: (value) =>
        value.trim().length < 5
          ? "Описание должно содержать минимум 5 символов"
          : null,
    },
  });

  const handleSubmit = async (values: CreateProjectRequest) => {
    setLoading(true);
    try {
      const res = (await ProjectAPI.createProject(values)).data;
      console.log(res)
      setProjects([...project, res])
      form.reset();
      close();
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={open}>Создать проект</Button>
      <Modal
        opened={modal}
        onClose={close}
        title="Создать новый проект"
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Название проекта"
              placeholder="Введите название проекта"
              required
              {...form.getInputProps("name")}
            />

            <Textarea
              label="Описание"
              placeholder="Опишите цель"
              minRows={3}
              required
              {...form.getInputProps("description")}
            />

            <Group grow>
              <NumberInput
                label="Бюджет"
                placeholder="0.00"
                min={0}
                decimalScale={2}
                fixedDecimalScale
                {...form.getInputProps("budget")}
              />

              <Select
                label="Статус"
                data={[
                  { value: "PLANNING", label: "Планирование" },
                  { value: "ACTIVE", label: "Активный" },
                  { value: "ON_HOLD", label: "На паузе" },
                ]}
                {...form.getInputProps("status")}
              />
            </Group>

            <Group grow>
              <TextInput
                label="Дата начала"
                type="date"
                {...form.getInputProps("startDate")}
              />

              <TextInput
                label="Дата окончания"
                type="date"
                {...form.getInputProps("endDate")}
              />
            </Group>

            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={close}>
                Отмена
              </Button>
              <Button type="submit" loading={loading}>
                Создать проект
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
