import { JSX, useState } from 'react';
import { Container, Tabs, Stack } from '@mantine/core';
import { useAuthStore } from '../../store/authStore';
import { UniversalTasks } from './UniversalTasks';

export function TasksPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<string | null>('all');
  const { user } = useAuthStore();
  const role = user?.role;


  return (
    <Container>
      <Stack gap="lg">
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="all">Все задачи</Tabs.Tab>
            {role != 'MANAGER' && <Tabs.Tab value="my">Мои задачи</Tabs.Tab>}
            <Tabs.Tab value="backlog">Бэклог</Tabs.Tab>
            <Tabs.Tab value="done">Выполнено</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="all">
            <UniversalTasks type="all" />
          </Tabs.Panel>

          {role != 'MANAGER' && (
            <Tabs.Panel value="my">
              <UniversalTasks type="solo" />
            </Tabs.Panel>
          )}

          <Tabs.Panel value="backlog">
            <UniversalTasks type="backlog" />
          </Tabs.Panel>

          <Tabs.Panel value="done">
            <UniversalTasks type="done" />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
