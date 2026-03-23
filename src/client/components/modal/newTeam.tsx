import { Button, Group, Modal, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { CreateTeamReq, Team } from "../../types";
import { TeamsAPI } from "../../services/api";
import { JSX } from "react";

export const NewTeams = ({
  setTeams,
  teams,
}: {
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  teams: Team[];
}): JSX.Element => {
  const [modal, { open, close }] = useDisclosure(false);

  const form = useForm<CreateTeamReq>({
    initialValues: {
      name: "",
      description: "",
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

  const handleSubmit = async (values: CreateTeamReq): Promise<void> => {
    try {
      const res = (await TeamsAPI.createTeam(values)).data;
      setTeams([...teams, res]);
      form.reset();
      close();
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  return (
    <>
      <Button onClick={open}>Создать команду</Button>
      <Modal opened={modal} onClose={close}>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Название проекта"
              placeholder="Введите название проекта"
              required
              {...form.getInputProps("name")}
            />
            <TextInput
              label="Описание проекта"
              placeholder="Введите описание проекта"
              required
              {...form.getInputProps("description")}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={close}>
                Отмена
              </Button>
              <Button type="submit">Создать проект</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
};
