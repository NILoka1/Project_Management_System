import React from "react";
import { AppShell, Group, Text, Button, NavLink, Stack } from "@mantine/core";
import { useAuthStore } from "../../store/authStore";
import { useNavigate, useLocation } from "react-router-dom";
import { Timers } from "../../components/Tasks/Timers";
import { JSX } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): JSX.Element {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () : void => {
    logout();
    navigate("/");
  };

  const navItems = [
    { label: "Главная", path: "/", protected: false },
    { label: "Дашборд", path: "/dashboard", protected: true },
    { label: "Задачи", path: "/tasks", protected: true },
    { label: "Проекты", path: "/projects", protected: true },
    { label: "Профиль", path: "/profile", protected: true },
  ];

  if (user?.role === "MANAGER") {
    navItems.push({ label: "Команды", path: "/teams", protected: true });
    navItems.push({ label: "Пользователи", path: "/users", protected: true });
  }

  const showTimers =
    isAuthenticated && (user?.role === "DEVELOPER" || user?.role === "TESTER");

  return (
    <AppShell
      padding="md"
      navbar={{
        width: 200,
        breakpoint: "sm",
        collapsed: { mobile: !isAuthenticated },
      }}
      header={{ height: 100 }}
    >
      {/* Навигация */}
      <AppShell.Navbar p="md">
        <AppShell.Section grow>
          <Stack gap="xs">
            {navItems
              .filter((item) => item.protected)
              .map((item) => (
                <NavLink
                  key={item.path}
                  label={item.label}
                  active={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                />
              ))}
          </Stack>
        </AppShell.Section>

        <AppShell.Section>
          <Button variant="light" color="red" fullWidth onClick={handleLogout}>
            Выйти
          </Button>
        </AppShell.Section>
      </AppShell.Navbar>

      {/* Шапка */}
      <AppShell.Header p="md">
        <Group justify="space-between" align="center" h="100%">
          <Text size="xl" fw={700}>
            IT Project Tracker
          </Text>

          <Group>
            {showTimers && <Timers />}
            {isAuthenticated && <Text>Добро пожаловать, {user?.name}</Text>}
          </Group>
        </Group>
      </AppShell.Header>

      {/* Основной контент */}
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
