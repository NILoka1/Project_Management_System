import React, { JSX, useState } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Stack,
  Notification,
} from "@mantine/core";
import { useAuthStore } from "../../store/authStore";
import { authAPI } from "../../services/api";
import { RegisterData } from "../../types";

export function RegisterForm({ onSuccess }: { onSuccess?: () => void }): JSX.Element {
  const [formData, setFormData] = useState<RegisterData>({
    email: "",
    password: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) :Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authAPI.register(formData);
      const { user, token } = response.data;

      login(user, token);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.error || "Ошибка регистрации");
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
        Регистрация
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
            label="Имя"
            placeholder="Ваше имя"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />

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
            minLength={6}
          />

          <Button type="submit" loading={loading} fullWidth mt="xl">
            Зарегистрироваться
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
