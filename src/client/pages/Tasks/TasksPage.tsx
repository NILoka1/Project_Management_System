import { JSX, useState } from "react";
import { Container, Tabs, Stack, Text } from "@mantine/core";
import Tasks from "./components/Tasks";
import BacklogTasks from "./components/backlog";
import DoneTasks from "./components/doneTasks";
import { useAuthStore } from "../../store/authStore";

export function TasksPage() :JSX.Element {
  const [activeTab, setActiveTab] = useState<string | null>("all");
  const { user } = useAuthStore();
  const role = user?.role;

  if (!user || !role) {
    return <Text>Загрузка...</Text>;
  }

  return (
    <Container>
      <Stack gap="lg">
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="all">Все задачи</Tabs.Tab>
            {role != "MANAGER" && <Tabs.Tab value="my">Мои задачи</Tabs.Tab>}
            <Tabs.Tab value="backlog">Бэклог</Tabs.Tab>
            <Tabs.Tab value="done">Выполнено</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="all">
            <Tasks role={role} solo={false} />
          </Tabs.Panel>

          {role != "MANAGER" && (
            <Tabs.Panel value="my">
              <Tasks role={role} solo={true} />
            </Tabs.Panel>
          )}

          <Tabs.Panel value="backlog">
            <BacklogTasks role={role} />
          </Tabs.Panel>

          <Tabs.Panel value="done">
            <DoneTasks />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
