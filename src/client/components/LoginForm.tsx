import React, { useState } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Stack,
  Notification,
} from "@mantine/core";
import { useAuthStore } from "../store/authStore";
import { authAPI } from "../services/api";
import { LoginData } from "../types";
import { JSX } from "react";

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) :JSX.Element {
  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authAPI.login(formData);
      const { user, token } = response.data;

      login(user, token);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.error || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      radius="md"
      p="xl"
      withBorder
      style={{ maxWidth: 400, margin: "auto" }}
    >
      <Title order={2} ta="center" mb="lg">
        Вход в систему
      </Title>

      {error && (
        <Notification
          color="red"
          title="Ошибка"
          onClose={() => setError("")}
          mb="md"
        >
          {error}
        </Notification>
      )}

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Email"
            placeholder="hello@example.com"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            required
          />

          <PasswordInput
            label="Пароль"
            placeholder="Ваш пароль"
            value={formData.password}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, password: e.target.value }))
            }
            required
          />

          <Button type="submit" loading={loading} fullWidth mt="xl">
            Войти
          </Button>

          <Text ta="center" size="sm">
            Нет аккаунта?{" "}
            <Text
              component="span"
              c="blue"
              style={{ cursor: "pointer" }}
              onClick={onSwitchToRegister}
            >
              Зарегистрироваться
            </Text>
          </Text>
        </Stack>
      </form>
    </Paper>
  );
}
