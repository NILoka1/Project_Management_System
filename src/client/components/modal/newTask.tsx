import { Button, Group, Modal, Stack, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { CreateTaskRequest } from "../../types";
import { DateInput } from "@mantine/dates";

export const NewTask = () => {
  const [modal, { open, close }] = useDisclosure(false);

  const form = useForm<CreateTaskRequest>({
    initialValues: {
      title: "",
      description: "",
      dueDate: undefined,
      projectId: "",
      creatorId: "",
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
    },
  });
  return (
    <>
      <Button onClick={open}>Создать задачу</Button>
      <Modal opened={modal} onClose={close}>
        <form>
          <Stack gap={"md"}>
            <TextInput
              label="Название задачи"
              placeholder="Введите название задачи"
              required
              {...form.getInputProps("title")}
            />
            <Textarea
              label="Описание"
              placeholder="Опишите цели и задачи проекта"
              minRows={3}
              required
              {...form.getInputProps("description")}
            />
            <DateInput
              label="Срок выполнения"
              placeholder="Выберите дату"
              valueFormat="DD.MM.YYYY"
              minDate={new Date()} // нельзя выбрать прошедшие даты
              clearable
              {...form.getInputProps("dueDate")}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={close}>
                Отмена
              </Button>
              <Button type="submit">
                Создать проект
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
};
