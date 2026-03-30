import { JSX, useState } from 'react';
import { Container, Tabs } from '@mantine/core';
import { RegisterForm } from '../components/auth/RegisterForm';
import { LoginForm } from '../components/auth/LoginForm';
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';

export function HomePage(): JSX.Element {
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<string | null>('login');

  // Если уже авторизован - редирект на дашборд
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Container size="sm">
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List grow>
          <Tabs.Tab value="login">Вход</Tabs.Tab>
          <Tabs.Tab value="register">Регистрация</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="login">
          <LoginForm
            onSuccess={() => {
              /* редирект произойдет автоматически */
            }}
            onSwitchToRegister={() => setActiveTab('register')}
          />
        </Tabs.Panel>

        <Tabs.Panel value="register">
          <RegisterForm onSuccess={() => setActiveTab('login')} />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
