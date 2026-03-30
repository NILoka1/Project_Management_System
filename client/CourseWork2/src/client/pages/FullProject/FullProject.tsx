import { Button, Grid, Group, Stack, Text, TextInput, NumberInput, Select } from '@mantine/core';
import { JSX } from 'react';
import { DateInput } from '@mantine/dates';
import { useFullProject } from './useFullProject';
import { FullProjectTeams } from './FullProjectTeams';
import { FullProjectTasks } from './FullProjectTasks';
import { StatePage } from '../../StatePage/StatePage';
import { Navigate } from 'react-router-dom';

export const FullProject = (): JSX.Element => {
  const { project, handleSave, handleCancel, error, loading, form, navigate } = useFullProject();

  return (
    <StatePage error={error} loading={loading}>
      <Stack>
        <form onSubmit={handleSave}>
          <TextInput label={'Название'} {...form.getInputProps('name')} />
          <TextInput label={'Описание'} {...form.getInputProps('description')} />
          <Select
            label={'Статус'}
            {...form.getInputProps('status')}
            data={[
              { value: 'PLANNING', label: 'Планирование' },
              { value: 'ACTIVE', label: 'Активный' },
              { value: 'ON_HOLD', label: 'На паузе' },
              { value: 'COMPLETED', label: 'Завершен' },
              { value: 'CANCELLED', label: 'Отменен' },
            ]}
          />
          <NumberInput
            label={'Прогресс'}
            {...form.getInputProps('progress')}
            min={0}
            max={100}
            suffix="%"
          />
          <NumberInput
            label={'Бюджет'}
            {...form.getInputProps('budget')}
            min={0}
            placeholder="Введите бюджет"
          />
          <DateInput
            label={'Дата начала'}
            {...form.getInputProps('startDate')}
            placeholder="Выберите дату"
          />
          <DateInput
            label={'Дата окончания'}
            {...form.getInputProps('endDate')}
            placeholder="Выберите дату"
          />
          {project?.createdAt && (
            <Group>
              <Text>Дата создания:</Text>
              <Text>{new Date(project.createdAt).toLocaleDateString()}</Text>
            </Group>
          )}
          <Grid>
            <FullProjectTeams project={project} />
            <FullProjectTasks project={project} />
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
              </Group>
            )}
            <Button
              onClick={() => {
                navigate('/projects');
              }}
              variant="outline"
            >
              Назад к проектам
            </Button>
          </Group>
        </form>
      </Stack>
    </StatePage>
  );
};
