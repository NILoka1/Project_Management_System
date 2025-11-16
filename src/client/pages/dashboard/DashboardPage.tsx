import { Grid, Stack } from "@mantine/core";
import { Tasks } from "./components/Tasks";
import { Charts } from "./components/Charts";
import { Stats } from "./components/Stats";
import { Projects } from "./components/Projects";
import { useAuthStore } from "./../../store/authStore";

export function DashboardPage() {
  const { user } = useAuthStore();

  if (!user) {
    return <div>Загрузка...</div>;
  }

  const role = user?.role;

  return (
    <Stack gap="lg">
      {/* 📊 Статистика сверху */}
      {role != "TESTER" && role != "DEVELOPER" && <Stats />}

      {role === "MANAGER" ? (
        <Projects />
      ) : (
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="md">
              <Tasks role={role} />
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              {role === "TEAM_LEAD" ? <Projects /> : <Charts />}
            </Stack>
          </Grid.Col>
        </Grid>
      )}
    </Stack>
  );
}
