export type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
  dueDate: string | null;
  completedAt: string | null;
}

export interface AgentLog {
  id: string;
  agentName: string;
  action: string;
  taskId: string | null;
  timestamp: string;
  details: string;
  status: "success" | "error" | "info" | "warning";
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
  tasksCompletedToday: number;
  tasksCompletedThisWeek: number;
}

export const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: "backlog", title: "Backlog", color: "bg-gray-500" },
  { id: "todo", title: "To Do", color: "bg-blue-500" },
  { id: "in_progress", title: "In Progress", color: "bg-yellow-500" },
  { id: "review", title: "Review", color: "bg-purple-500" },
  { id: "done", title: "Done", color: "bg-green-500" },
];

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; badge: string }> = {
  low: { label: "Low", color: "text-gray-400", badge: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  medium: { label: "Medium", color: "text-blue-400", badge: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  high: { label: "High", color: "text-orange-400", badge: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  critical: { label: "Critical", color: "text-red-400", badge: "bg-red-500/20 text-red-400 border-red-500/30" },
};
