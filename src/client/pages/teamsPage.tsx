import { useEffect, useState } from "react";
import {
  Card,
  Text,
  Group,
  Stack,
  Container,
  Title,
  Button,
} from "@mantine/core";
import { Team } from "../types";
import { TeamsAPI } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { NewTeams } from "../components/modal/newTeam";
import { useNavigate } from "react-router-dom";

export function TeamList() {
  const { user } = useAuthStore();
  const role = user?.role;

  if (role != "MANAGER") {
    return <Text>Доступ запрещён</Text>;
  }

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getData = async () => {
      setTeams((await TeamsAPI.getTeams()).data);
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
        <Title order={2}>Команды</Title>

        <NewTeams teams={teams} setTeams={setTeams} />

        {teams.map((team) => (
          <Card key={team.id} shadow="sm" padding="lg" withBorder>
            <Group justify="space-between" mb="xs">
              <Button
                onClick={() => {
                  navigate(`/team/${team.id}`);
                }}
                fw={"15px"}
                variant="light"
                ta={"left"}
                color="rgba(0, 0, 0, 1)"
              >
                <Text size="md" mb="md">
                  {team.name}
                </Text>
              </Button>
            </Group>

            <Text ml={"lg"} size="sm" c="dimmed" mb="md">
              {team.description}
            </Text>

            <Text ml={"lg"} size="sm" c="dimmed" mb="md">
              {new Date(team.createdAt).toLocaleDateString()}
            </Text>
          </Card>
        ))}

        {teams.length === 0 && (
          <Card>
            <Text>Команды не найдены. Добавьте первую команду!</Text>
          </Card>
        )}
      </Stack>
    </>
  );
}
