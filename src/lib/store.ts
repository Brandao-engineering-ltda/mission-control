"use client";

import { create } from "zustand";
import { Task, TaskStatus, AgentLog, DashboardStats } from "./types";

// Generate a simple ID
function genId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// Seed data
const SEED_TASKS: Task[] = [
  {
    id: genId(),
    title: "Set up Supabase project",
    description: "Create Supabase project, configure auth, and set up database schema with Drizzle ORM",
    status: "done",
    priority: "high",
    tags: ["infrastructure", "database"],
    assignee: "Developer Agent",
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    dueDate: new Date(Date.now() - 4 * 86400000).toISOString(),
    completedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: genId(),
    title: "Implement tRPC API layer",
    description: "Set up tRPC router with task CRUD operations and real-time subscriptions",
    status: "done",
    priority: "high",
    tags: ["api", "backend"],
    assignee: "Developer Agent",
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    dueDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    completedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: genId(),
    title: "Build Kanban board UI",
    description: "Create drag-and-drop Kanban board with columns for each task status",
    status: "in_progress",
    priority: "high",
    tags: ["frontend", "ui"],
    assignee: "Developer Agent",
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    dueDate: new Date(Date.now() + 1 * 86400000).toISOString(),
    completedAt: null,
  },
  {
    id: genId(),
    title: "Add Framer Motion animations",
    description: "Implement smooth transitions for task cards, column reordering, and completion celebrations",
    status: "todo",
    priority: "medium",
    tags: ["frontend", "animation"],
    assignee: null,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    completedAt: null,
  },
  {
    id: genId(),
    title: "Integrate OpenClaw agent logs",
    description: "Capture and display agent work logs with real-time streaming from Supabase Realtime",
    status: "todo",
    priority: "high",
    tags: ["integration", "agents"],
    assignee: null,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    completedAt: null,
  },
  {
    id: genId(),
    title: "Build analytics dashboard",
    description: "Create charts for task completion rates, velocity, and burndown using Recharts",
    status: "backlog",
    priority: "medium",
    tags: ["frontend", "analytics"],
    assignee: null,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    completedAt: null,
  },
  {
    id: genId(),
    title: "Set up Supabase Auth",
    description: "Implement authentication with Supabase Auth, including GitHub OAuth provider",
    status: "backlog",
    priority: "low",
    tags: ["auth", "security"],
    assignee: null,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    dueDate: new Date(Date.now() + 21 * 86400000).toISOString(),
    completedAt: null,
  },
  {
    id: genId(),
    title: "Deploy to Vercel",
    description: "Configure Vercel deployment with environment variables and preview deployments",
    status: "backlog",
    priority: "low",
    tags: ["devops", "deployment"],
    assignee: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 21 * 86400000).toISOString(),
    completedAt: null,
  },
  {
    id: genId(),
    title: "Design system tokens",
    description: "Define color palette, spacing, typography tokens for consistent dark-mode UI",
    status: "review",
    priority: "medium",
    tags: ["design", "ui"],
    assignee: "Developer Agent",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    completedAt: null,
  },
  {
    id: genId(),
    title: "Write E2E tests for Kanban",
    description: "Create Playwright tests for drag-and-drop, task creation, and status transitions",
    status: "backlog",
    priority: "low",
    tags: ["testing", "quality"],
    assignee: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: null,
    completedAt: null,
  },
];

const SEED_LOGS: AgentLog[] = [
  {
    id: genId(),
    agentName: "Developer Agent",
    action: "Scaffolded Next.js 15 project",
    taskId: null,
    timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
    details: "Created mission-control-brandao repo with TypeScript, Tailwind, App Router",
    status: "success",
  },
  {
    id: genId(),
    agentName: "Developer Agent",
    action: "Configured Supabase",
    taskId: null,
    timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
    details: "Set up Supabase project, created tasks and agent_logs tables with Drizzle schema",
    status: "success",
  },
  {
    id: genId(),
    agentName: "Researcher Agent",
    action: "Tech stack analysis complete",
    taskId: null,
    timestamp: new Date(Date.now() - 6 * 86400000).toISOString(),
    details: "Recommended Next.js 15 + tRPC + shadcn/ui + Framer Motion + Supabase stack",
    status: "info",
  },
  {
    id: genId(),
    agentName: "Developer Agent",
    action: "Implemented tRPC routes",
    taskId: null,
    timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
    details: "Created task.create, task.update, task.delete, task.list procedures",
    status: "success",
  },
  {
    id: genId(),
    agentName: "Developer Agent",
    action: "Build error resolved",
    taskId: null,
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
    details: "Fixed TypeScript strict mode errors in Drizzle schema definitions",
    status: "error",
  },
  {
    id: genId(),
    agentName: "Developer Agent",
    action: "Kanban board WIP",
    taskId: null,
    timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
    details: "Implementing drag-and-drop with @dnd-kit, column rendering complete",
    status: "info",
  },
];

interface StoreState {
  tasks: Task[];
  logs: AgentLog[];
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "completedAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, newStatus: TaskStatus) => void;
  addLog: (log: Omit<AgentLog, "id">) => void;
  getStats: () => DashboardStats;
}

export const useStore = create<StoreState>((set, get) => ({
  tasks: SEED_TASKS,
  logs: SEED_LOGS,

  addTask: (taskData) => {
    const now = new Date().toISOString();
    const task: Task = {
      ...taskData,
      id: genId(),
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    };
    set((state) => ({ tasks: [task, ...state.tasks] }));
    get().addLog({
      agentName: "System",
      action: `Task created: ${task.title}`,
      taskId: task.id,
      timestamp: now,
      details: `Priority: ${task.priority}, Status: ${task.status}`,
      status: "info",
    });
  },

  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      ),
    }));
  },

  deleteTask: (id) => {
    const task = get().tasks.find((t) => t.id === id);
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    if (task) {
      get().addLog({
        agentName: "System",
        action: `Task deleted: ${task.title}`,
        taskId: id,
        timestamp: new Date().toISOString(),
        details: "",
        status: "info",
      });
    }
  },

  moveTask: (id, newStatus) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;
    const now = new Date().toISOString();
    const updates: Partial<Task> = {
      status: newStatus,
      updatedAt: now,
      completedAt: newStatus === "done" ? now : task.completedAt,
    };
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
    get().addLog({
      agentName: "System",
      action: `Task moved: ${task.title}`,
      taskId: id,
      timestamp: now,
      details: `${task.status} → ${newStatus}`,
      status: "success",
    });
  },

  addLog: (logData) => {
    const log: AgentLog = { ...logData, id: genId() };
    set((state) => ({ logs: [log, ...state.logs] }));
  },

  getStats: () => {
    const tasks = get().tasks;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const completedTasks = tasks.filter((t) => t.status === "done").length;
    const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length;
    const overdueTasks = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "done"
    ).length;

    return {
      totalTasks: tasks.length,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      completionRate: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0,
      tasksCompletedToday: tasks.filter(
        (t) => t.completedAt && new Date(t.completedAt) >= todayStart
      ).length,
      tasksCompletedThisWeek: tasks.filter(
        (t) => t.completedAt && new Date(t.completedAt) >= weekStart
      ).length,
    };
  },
}));
