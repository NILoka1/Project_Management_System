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
  CreateProjectRequest,
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

export const tasksAPI = {
  getAllTask: (): Promise<{ data: Task[] }> => api.get("/tasks/team"),
  getPersonalTask: (): Promise<{ data: Task[] }> => api.get("/tasks/my"),
  getBacklogTask: (): Promise<{ data: Task[] }> => api.get("/tasks/backlog"),
  getDoneTask: (): Promise<{ data: Task[] }> => api.get("/tasks/done"),
};

export const ProjectAPI = {
  getProject: (): Promise<{data: Project[]}> => api.get("/project"),
  createProject:(data: CreateProjectRequest) : Promise<{data: Project}> => api.post('/projects', data)
}

export default api;
