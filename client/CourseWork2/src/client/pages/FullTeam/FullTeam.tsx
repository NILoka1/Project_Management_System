import { Button, Grid, Group, Stack, Text, TextInput } from '@mantine/core';
import { JSX } from 'react';
import { useFullTeam } from './useFullTeam';
import { FullTeamMembers } from './FullTeamMembers';
import { FullTeamProjects } from './FullTeamProjects';
import { StatePage } from '../../StatePage/StatePage';

export const FullOneTeam = (): JSX.Element => {
  const {
    team,
    error,
    handleSubmit,
    handleAddMembers,
    handleAddProjects,
    loading,
    form,
    handleCancel,
    navigate,
  } = useFullTeam();

  return (
    <StatePage error={error} loading={loading}>
      <Stack>
        <form onSubmit={handleSubmit}>
          <TextInput label={'Название:'} {...form.getInputProps('name')} />
          <TextInput label={'Описание:'} {...form.getInputProps('description')} />
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

          <Group
            justify="center"
            style={{
              position: 'sticky',
              bottom: 0,
              background: 'white',
              padding: '12px',
              borderTop: '1px solid #eee',
              zIndex: 10,
            }}
          >
            {form.isDirty() && (
              <Group>
                <Button type="submit">Сохранить</Button>
                <Button variant="outline" onClick={handleCancel}>
                  Отмена
                </Button>
                <Button
                  onClick={() => {
                    navigate('/teams');
                  }}
                  variant="outline"
                >
                  Выйти
                </Button>
              </Group>
            )}
          </Group>
        </form>
      </Stack>
    </StatePage>
  );
};
