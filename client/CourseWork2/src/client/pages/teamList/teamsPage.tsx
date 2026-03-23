import { Card, Text, Stack, Container, Title } from '@mantine/core';
import { useAuthStore } from '../../store/authStore';
import { NewTeams } from '../../components/modal/newTeam';
import { useNavigate } from 'react-router-dom';
import { useTeams } from './useTeams';
import { TeamCard } from './TeamCard';
export function TeamList() {
  const { user } = useAuthStore();
  const role = user?.role;

  if (role != 'MANAGER') {
    return <Text>Доступ запрещён</Text>;
  }
  const { teams, setTeams, loading, error } = useTeams();
  const navigate = useNavigate();

  if (error) {
    return (
      <Container>
        <Text>Необработанная ошибка</Text>
      </Container>
    );
  }

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
          <TeamCard team={team} navigate={navigate}></TeamCard>
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
