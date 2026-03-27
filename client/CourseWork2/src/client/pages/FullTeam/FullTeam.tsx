import { Button, Grid, Group, Stack, Text, TextInput } from '@mantine/core';
import { JSX } from 'react';
import { useFullTeam } from './useFullTeam';
import { FullTeamMembers } from './FullTeamMembers';
import { FullTeamProjects } from './FullTeamProjects';
import { StatePage } from '../../components/StatePage';

export const FullOneTeam = (): JSX.Element => {
  const {
    team,
    isUpdate,
    open,
    updatedTeam,
    setUpdatedTeam,
    error,
    handleSave,
    handleAddMembers,
    handleAddProjects,
    loading,
  } = useFullTeam();

  return (
    <StatePage error={error} loading={loading}>
      <Stack>
        <Group>
          <Text fw={700}>Название:</Text>
          <TextInput
            value={updatedTeam.name}
            onChange={(e) => {
              setUpdatedTeam({ ...updatedTeam, name: e.currentTarget.value });
              open();
            }}
          />
        </Group>
        <Group>
          <Text fw={400}>Описание:</Text>
          <TextInput
            value={updatedTeam.description}
            onChange={(e) => {
              setUpdatedTeam({ ...updatedTeam, description: e.currentTarget.value });
              open();
            }}
          />
        </Group>
        {team?.createdAt && (
          <Group>
            <Text>Дата создания:</Text>
            <Text>{new Date(team.createdAt).toLocaleDateString()}</Text>
          </Group>
        )}
        <Grid>
          <FullTeamMembers team={team} handleAddMembers={handleAddMembers} />
          <FullTeamProjects team={team} handleAddProjects={handleAddProjects} />
        </Grid>
        {isUpdate && (
          <Group>
            <Button onClick={handleSave}>Сохранить</Button>
            <Button
              variant="outline"
              onClick={() => {
                // Отмена изменений - возвращаем исходные значения
                if (team) {
                  setUpdatedTeam({ name: team.name, description: team.description });
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
    </StatePage>
  );
};
