// User types
// Router types
export type Route = {
  path: string;
  element: React.ReactNode;
  protected?: boolean;
};

export type AppRoute =
  | "home"
  | "register"
  | "login"
  | "dashboard"
  | "projects"
  | "profile";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  createdAt: string;
}

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
}

export type Role = "MANAGER" | "TEAM_LEAD" | "DEVELOPER" | "TESTER";

// Project types
export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  progress: number;
  budget: number | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus =
  | "PLANNING"
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED";

// Task types
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  projectId: string;
  assigneeId: string | null;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus =
  | "BACKLOG"
  | "TODO"
  | "IN_PROGRESS"
  | "REVIEW"
  | "TESTING"
  | "DONE";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

// Time Entry types
export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  startTime: string;
  endTime: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

// Team types
export interface Team {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface FullTeam {
  id: string;
  name: string;
  description: string | null;
  members: User[];
  projects: Project[];
  createdAt: string;
  updatedAt: string;
}

export interface FullProjects {
  id: string;
  name: string;
  description: string | null;
  status: string;
  progress: number;
  budget: number | null;
  startDate: string | null;
  endDate: string | null;
  teams: Team[];
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamUser {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
}

export type TeamRole = "LEADER" | "MEMBER";

export interface ProjectTeam {
  id: string;
  projectId: string;
  teamId: string;
}

// Auth types
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: SafeUser; // Используем SafeUser вместо Omit
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
}

// Store types
export interface AuthState {
  user: SafeUser | null; // Храним SafeUser в store
  token: string | null;
  isAuthenticated: boolean;
  login: (user: SafeUser, token: string) => void;
  logout: () => void;
}

// Dashboard types
// types/index.ts
// types/index.ts
export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  hoursThisWeek: number;
  hoursToday: number;
  productivity: number;
  projectsCount: number;
  teamMembersCount?: number;
  overdueTasks: number;
  activeTimer?: string | null;
  budgetStats?: {
    planned: number;
    used: number;
    remaining: number;
  };
}
// types/index.ts
export interface ProductivityData {
  productivity: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}

export interface TimeStats {
  distribution: Array<{
    category: string;
    value: number;
    color: string;
    count: number;
  }>;
  totalTasks: number;
}

// Query parameters for dashboard
export interface DashboardQueryParams {
  period?: "week" | "month" | "quarter";
  teamId?: string;
  projectId?: string;
  userId?: string;
}

// types/projects.ts
export interface CreateProjectRequest {
  name: string;
  description: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
  status?: ProjectStatus;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  dueDate?: string;
  projectId: string;
}

export interface CreateTeamReq {
  name: string;
  description: string;
}
