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
  CreateTaskRequest,
  Team,
  CreateTeamReq,
  User,
  FullTeam,
  FullProjects,
  TimeEntry,
} from "../types";
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Если Network Error или сервер ещё не готов — ждём и пробуем ещё раз (максимум 10 раз)
    if (
      !error.response &&
      (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED")
    ) {
      const maxRetries = 10;
      let retryCount = error.config.__retryCount || 0;

      if (retryCount < maxRetries) {
        error.config.__retryCount = retryCount + 1;
        const delay = (retryCount + 1) * 1500; // 1.5s, 3s, 4.5s...
        console.log(
          `Сервер ещё запускается... попытка ${
            retryCount + 1
          }/${maxRetries} через ${delay / 1000}с`
        );
        await new Promise((res) => setTimeout(res, delay));
        return api(error.config);
      }
    }
    return Promise.reject(error);
  }
);

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
  createTask: (data: CreateTaskRequest): Promise<{ data: Task }> =>
    api.post("/tasks", data),
  // В dashboardAPI или отдельно tasksAPI
  updateTaskStatus: (
    taskId: string,
    status: TaskStatus
  ): Promise<{ data: Task }> => api.put(`/tasks/${taskId}/status`, { status }),
};

export const ProjectAPI = {
  getProjects: (): Promise<{ data: Project[] }> => api.get("/project"),
  createProject: (data: CreateProjectRequest): Promise<{ data: Project }> =>
    api.post("/projects", data),
  getProject: (projectId: string): Promise<{ data: FullProjects }> =>
    api.get(`/projects/${projectId}`),
  updateProject: (
    projectId: string,
    data: {
      name: string;
      description: string;
      status: string;
      progress: number;
      budget: number | null;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<{ data: Project }> => api.patch(`/projects/${projectId}`, data),
};

export const TeamsAPI = {
  getTeams: (): Promise<{ data: Team[] }> => api.get("/teams"),
  createTeam: (data: CreateTeamReq): Promise<{ data: Team }> =>
    api.post("/teams", data),
  getTeam: (teamId: string): Promise<{ data: FullTeam }> =>
    api.get(`/teams/${teamId}`),
  updateTeam: (
    teamId: string,
    data: { name: string; description: string }
  ): Promise<{ data: Team }> => api.patch(`/teams/${teamId}`, data),
  addMembers: (
    teamId: string,
    userIds: string[]
  ): Promise<{ data: { members: User[]; addedCount: number } }> =>
    api.post(`/teams/${teamId}/members`, { userIds }),

  addProjects: (
    teamId: string,
    projectIds: string[]
  ): Promise<{ data: { projects: Project[]; addedCount: number } }> =>
    api.post(`/teams/${teamId}/projects`, { projectIds }),
};

export const UsersAPI = {
  getUsers: (): Promise<{ data: User[] }> => api.get("/users"),
  updateUserRole: (id: string, role: string): Promise<{ data: User }> =>
    api.patch("/users/update", { id, role }),
};

// services/api.ts
export const TimeEntriesAPI = {
  createTimeEntry: (data: {
    taskId: string;
    startTime: string;
    endTime: string;
    duration: number;
  }): Promise<{ data: TimeEntry }> => api.post("/time-entries", data),

  getTimeEntries: (): Promise<{ data: TimeEntry[] }> =>
    api.get("/time-entries"),
  getUserTimeEntries: (userId: string): Promise<{ data: TimeEntry[] }> =>
    api.get(`/time-entries/user/${userId}`),
  getTaskTimeEntries: (taskId: string): Promise<{ data: TimeEntry[] }> =>
    api.get(`/time-entries/task/${taskId}`),
};

export default api;
