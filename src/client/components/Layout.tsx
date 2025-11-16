import React from "react";
import { AppShell, Group, Text, Button, NavLink, Stack } from "@mantine/core";
import { useAuthStore } from "../store/authStore";
import { useNavigate, useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
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

  return (
    <AppShell
      padding="md"
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !isAuthenticated },
      }}
      header={{ height: 60 }}
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
          {isAuthenticated && <Text>Добро пожаловать, {user?.name}</Text>}
        </Group>
      </AppShell.Header>

      {/* Основной контент */}
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
