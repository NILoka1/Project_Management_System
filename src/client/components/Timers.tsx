// components/Timers.tsx
import { Group, Paper, Text, Button } from "@mantine/core";
import { IconPlayerStop } from "@tabler/icons-react";
import { useTimerStore } from "../store/timerStore";

export function Timers() {
  const { isRunning, currentTask, elapsedSeconds, stopTimer } = useTimerStore();

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isRunning) return null;

  return (
    <Group>
      <Paper p="sm" withBorder bg="blue.1">
        <Group gap="md">
          <div>
            <Text size="sm" fw={500}>
              {currentTask?.title}
            </Text>
            <Text size="lg" fw={700}>
              {formatTime(elapsedSeconds)}
            </Text>
          </div>
          <Button
            size="sm"
            color="red"
            leftSection={<IconPlayerStop size={14} />}
            onClick={stopTimer}
          >
            Стоп
          </Button>
        </Group>
      </Paper>
    </Group>
  );
}
