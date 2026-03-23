// store/timerStore.ts
import { create } from "zustand";
import { TimeEntriesAPI } from "../services/api";

interface TimerState {
  isRunning: boolean;
  currentTask: {
    id: string;
    title: string;
  } | null;
  startTime: Date | null;
  elapsedSeconds: number;

  // Действия
  startTimer: (taskId: string, taskTitle: string) => void;
  stopTimer: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  isRunning: false,
  currentTask: null,
  startTime: null,
  elapsedSeconds: 0,

  startTimer: (taskId: string, taskTitle: string) => {
    const startTime = new Date();

    const interval = setInterval(() => {
      const state = get();
      if (state.isRunning && state.startTime) {
        const now = new Date();
        const elapsedSeconds = Math.floor(
          (now.getTime() - state.startTime.getTime()) / 1000
        );
        set({ elapsedSeconds });
      }
    }, 1000);

    set({
      isRunning: true,
      currentTask: { id: taskId, title: taskTitle },
      startTime,
      elapsedSeconds: 0,
    });

    (window as any).timerInterval = interval;
  },

  stopTimer: async () => {
    const state = get();

    if (!state.isRunning || !state.startTime || !state.currentTask) return;

    // Останавливаем таймер
    if ((window as any).timerInterval) {
      clearInterval((window as any).timerInterval);
    }

    const endTime = new Date();
    const duration = Math.floor(state.elapsedSeconds / 60);

    try {
      // Используем API функцию вместо fetch
      await TimeEntriesAPI.createTimeEntry({
        taskId: state.currentTask.id,
        startTime: state.startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: duration,
      });

      console.log("Time entry saved successfully");
    } catch (error) {
      console.error("Ошибка сохранения времени:", error);
    }

    // Сбрасываем состояние
    set({
      isRunning: false,
      currentTask: null,
      startTime: null,
      elapsedSeconds: 0,
    });
  },
}));
