// components/TaskTimer.tsx
import { Button } from "@mantine/core";
import { IconPlayerPlay, IconPlayerStop } from "@tabler/icons-react";
import { useTimerStore } from "../store/timerStore";

interface TaskTimerProps {
  taskId: string;
  taskTitle: string;
}

export function TaskTimer({ taskId, taskTitle }: TaskTimerProps) {
  const { isRunning, currentTask, startTimer, stopTimer } = useTimerStore();

  const isThisTaskRunning = isRunning && currentTask?.id === taskId;

  const handleClick = () => {
    if (isThisTaskRunning) {
      stopTimer();
    } else {
      startTimer(taskId, taskTitle);
    }
  };

  return (
    <Button
      leftSection={
        isThisTaskRunning ? (
          <IconPlayerStop size={16} />
        ) : (
          <IconPlayerPlay size={16} />
        )
      }
      color={isThisTaskRunning ? "red" : "blue"}
      onClick={handleClick}
      size="sm"
    >
      {isThisTaskRunning ? "Стоп" : "Старт"}
    </Button>
  );
}
