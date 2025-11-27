import {
  Button,
  Flex,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FullTeam } from "../types";
import { TeamsAPI } from "../services/api";
import { useDisclosure } from "@mantine/hooks";
import { AddMembers } from "../components/modal/AddMembers";
import { AddProjectsModal } from "../components/modal/AddProjects";

export const FullOneTeam = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const [team, setTeam] = useState<FullTeam>();
  const [isUpdate, { open, close }] = useDisclosure(false);

  // Состояния для хранения измененных данных
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!teamId) {
    return <Text>Ошибка!</Text>;
  }

  useEffect(() => {
    const getTeam = async () => {
      const teamData = (await TeamsAPI.getTeam(teamId)).data;
      setTeam(teamData);
      // Инициализируем состояния данными из API
      setName(teamData.name);
      setDescription(teamData.description || "");
    };

    getTeam();
  }, [teamId]);

  // Обработчик сохранения
  const handleSave = async () => {
    try {
      // Здесь будет вызов API для обновления команды
      console.log("Данные для отправки:", {
        name,
        description,
      });

      await TeamsAPI.updateTeam(teamId, { name, description });

      // Обновляем локальное состояние
      if (team) {
        setTeam({
          ...team,
          name,
          description,
        });
      }

      close(); // Закрываем режим редактирования
    } catch (error) {
      console.error("Ошибка при обновлении:", error);
    }
  };

  // Обработчики изменений
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.currentTarget.value);
    open(); // Открываем режим редактирования
  };

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDescription(event.currentTarget.value);
    open(); // Открываем режим редактирования
  };

  const handleAddMembers = async (userIds: string[]) => {
    try {
      const response = await TeamsAPI.addMembers(teamId, userIds);
      const members = response.data.members;

      console.log("Добавляем участников:", userIds);

      if (team) {
        setTeam({
          ...team,
          members: members,
        });
      }
    } catch (error) {
      console.error("Ошибка при добавлении участников:", error);
    }
  };

  // Получаем ID существующих участников
  const existingMemberIds = team?.members.map((member) => member.id) || [];

  const handleAddProjects = async (projectIds: string[]) => {
    try {
      if (!team) return;

      // Вызов API для добавления проектов в команду
      const response = await TeamsAPI.addProjects(teamId, projectIds);

      console.log("Добавляем проекты:", projectIds);

      // Обновляем локальное состояние
      setTeam({
        ...team,
        projects: response.data.projects,
      });
    } catch (error) {
      console.error("Ошибка при добавлении проектов:", error);
    }
  };

  // Получаем ID существующих проектов
  const existingProjectIds = team?.projects.map((project) => project.id) || [];

  console.log(team);
  return (
    <>
      <Stack>
        <Group>
          <Text fw={700}>Название:</Text>
          <TextInput value={name} onChange={handleNameChange} />
        </Group>
        <Group>
          <Text fw={400}>Описание:</Text>
          <TextInput value={description} onChange={handleDescriptionChange} />
        </Group>
        {team?.createdAt && (
          <Group>
            <Text>Дата создания:</Text>
            <Text>{new Date(team.createdAt).toLocaleDateString()}</Text>
          </Group>
        )}
        <Grid>
          <Grid.Col span={6}>
            <Paper bg={"gray.5"} p={"md"}>
              <Stack>
                <Group>
                  <Text>Участники:</Text>
                  <AddMembers
                    onMembersAdd={handleAddMembers}
                    existingMembers={existingMemberIds}
                  />
                </Group>
                <Flex gap={"3px"} wrap={"wrap"}>
                  {team?.members.map((member) => (
                    <Paper key={member.id} p={"3px"} bg={"gray.3"}>
                      <Text>{member.name}</Text>
                      <Text>{member.email}</Text>
                    </Paper>
                  ))}
                </Flex>
              </Stack>
            </Paper>
          </Grid.Col>
          <Grid.Col span={6}>
            <Paper bg={"gray.5"} p={"md"}>
              <Stack>
                <Group justify="space-between">
                  <Text>Проекты:</Text>
                  <AddProjectsModal
                    onProjectsAdd={handleAddProjects}
                    existingProjects={existingProjectIds}
                  />
                </Group>
                <Flex gap={"3px"} wrap={"wrap"}>
                  {team?.projects.map((project) => (
                    <Paper key={project.id} p={"3px"} bg={"gray.3"}>
                      <Text>{project.name}</Text>
                      <Text>{project.description}</Text>
                    </Paper>
                  ))}
                </Flex>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
        {isUpdate && (
          <Group>
            <Button onClick={handleSave}>Сохранить</Button>
            <Button
              variant="outline"
              onClick={() => {
                // Отмена изменений - возвращаем исходные значения
                if (team) {
                  setName(team.name);
                  setDescription(team.description || "");
                }
                close();
              }}
            >
              Отмена
            </Button>
          </Group>
        )}
        <Button variant="outline">Выйти</Button>
      </Stack>
    </>
  );
};
