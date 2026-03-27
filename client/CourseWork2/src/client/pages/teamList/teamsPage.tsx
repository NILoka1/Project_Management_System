import { Card, Text, Stack, Title } from '@mantine/core';
import { useAuthStore } from '../../store/authStore';
import { NewTeams } from '../../components/modal/newTeam';
import { useNavigate } from 'react-router-dom';
import { useTeams } from './useTeams';
import { TeamCard } from './TeamCard';
import { StatePage } from '../../components/StatePage';
export function TeamList() {
  const { user } = useAuthStore();
  const role = user?.role;

  if (role != 'MANAGER') {
    return <Text>Доступ запрещён</Text>;
  }
  const { teams, setTeams, loading, error } = useTeams();
  const navigate = useNavigate();

  return (
    <StatePage error={error} loading={loading}>
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
    </StatePage>
  );
}
