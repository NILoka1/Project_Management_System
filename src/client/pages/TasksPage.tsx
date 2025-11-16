import React, { useState } from 'react';
import { Container, Tabs, Stack, Text } from '@mantine/core';
import { TaskList } from '../components/TaskList';

export function TasksPage() {
  const [activeTab, setActiveTab] = useState<string | null>('all');

  return (
    <Container>
      <Stack gap="lg">
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="all">Все задачи</Tabs.Tab>
            <Tabs.Tab value="my">Мои задачи</Tabs.Tab>
            <Tabs.Tab value="backlog">Бэклог</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="all">
            <TaskList />
          </Tabs.Panel>

          <Tabs.Panel value="my">
            <Text>Мои задачи (будет реализовано)</Text>
          </Tabs.Panel>

          <Tabs.Panel value="backlog">
            <Text>Задачи в бэклоге (будет реализовано)</Text>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}