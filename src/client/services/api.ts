import axios from "axios";
import { useAuthStore } from "../store/authStore";
import {
  LoginData,
  RegisterData,
  AuthResponse,
  Task,
  Priority,
  ProductivityData,
  TimeStats,
  Project,
  DashboardStats,
  TaskStatus,
} from "../types";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data: RegisterData): Promise<{ data: AuthResponse }> =>
    api.post("/auth/register", data),

  login: (data: LoginData): Promise<{ data: AuthResponse }> =>
    api.post("/auth/login", data),
};

export const tasksAPI = {
  getTasks: (projectId?: string): Promise<{ data: Task[] }> => {
    const url = projectId ? `/api/tasks?projectId=${projectId}` : "/tasks";
    return api.get(url);
  },

  getMyTasks: (): Promise<{ data: Task[] }> => api.get("/tasks/my"),

  createTask: (data: {
    title: string;
    description?: string;
    projectId: string;
    priority?: Priority;
  }): Promise<{ data: Task }> => api.post("/tasks", data),

  updateTask: (taskId: string, data: Partial<Task>): Promise<{ data: Task }> =>
    api.patch(`/api/tasks/${taskId}`, data),
};

export const dashboardAPI = {
  // 📊 Статистика для дашборда
  getDashboardStats: (): Promise<{
    data: DashboardStats;
  }> => api.get("/dashboard/stats"),

  // 🚀 Проекты пользователя (с фильтрацией по роли)
  getUserProjects: (): Promise<{
    data: Project[];
  }> => api.get("/dashboard/projects"),

  // ✅ Задачи пользователя (с фильтрацией по роли)
  getUserTasks: (params?: {
    status?: TaskStatus[];
    priority?: Priority[];
    limit?: number;
  }): Promise<{
    data: Task[];
  }> => api.get("/dashboard/tasks", { params }),

  getProductivityData: (
    period: "week" | "month" = "week"
  ): Promise<{ data: ProductivityData }> =>
    api.get("/dashboard/analytics/productivity", { params: { period } }),

  getTimeStats: (
    period: "week" | "month" = "week"
  ): Promise<{ data: TimeStats }> =>
    api.get("/dashboard/analytics/time", { params: { period } }),
};

export default api;
