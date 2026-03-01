"use client";

import { create } from "zustand";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";
import type { Task, AgentLog, DashboardStats, TaskStatus } from "./types";
import type { RealtimeChannel } from "@supabase/supabase-js";

// ============================================================
// Row ↔ Domain mappers (untyped client — rows come as `any`)
// ============================================================
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    status: row.status as Task["status"],
    priority: row.priority as Task["priority"],
    tags: row.tags || [],
    assignee: row.assignee || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    dueDate: row.due_date || null,
    completedAt: row.completed_at || null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToLog(row: any): AgentLog {
  return {
    id: row.id,
    agentName: row.agent_name,
    action: row.action,
    taskId: row.task_id || null,
    timestamp: row.created_at,
    details: row.details || "",
    status: row.status as AgentLog["status"],
  };
}

// ============================================================
// Seed data for offline/demo mode
// ============================================================
function genId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

const SEED_TASKS: Task[] = [
  {
    id: genId(),
    title: "Set up Supabase project",
    description: "Create Supabase project, configure auth, and set up database schema",
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
    title: "Wire Supabase Realtime",
    description: "Connect dashboard to live Supabase data with realtime subscriptions",
    status: "todo",
    priority: "high",
    tags: ["integration", "realtime"],
    assignee: null,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    completedAt: null,
  },
  {
    id: genId(),
    title: "Add analytics dashboard",
    description: "Create charts for task completion rates and velocity",
    status: "backlog",
    priority: "medium",
    tags: ["frontend", "analytics"],
    assignee: null,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
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
    details: "Created mission-control repo with TypeScript, Tailwind, App Router",
    status: "success",
  },
  {
    id: genId(),
    agentName: "Researcher Agent",
    action: "Tech stack analysis complete",
    taskId: null,
    timestamp: new Date(Date.now() - 6 * 86400000).toISOString(),
    details: "Recommended Next.js 15 + Supabase + shadcn/ui stack",
    status: "info",
  },
];

// ============================================================
// Store interface
// ============================================================
interface StoreState {
  // Data
  tasks: Task[];
  logs: AgentLog[];
  isOnline: boolean;       // true = Supabase connected
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  cleanup: () => void;
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "completedAt">) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (id: string, newStatus: TaskStatus) => Promise<void>;
  addLog: (log: Omit<AgentLog, "id">) => void;
  getStats: () => DashboardStats;
  refreshTasks: () => Promise<void>;
  refreshLogs: () => Promise<void>;
}

// Track realtime channels for cleanup
let tasksChannel: RealtimeChannel | null = null;
let logsChannel: RealtimeChannel | null = null;

export const useStore = create<StoreState>((set, get) => ({
  tasks: [],
  logs: [],
  isOnline: false,
  isLoading: true,
  error: null,

  // --------------------------------------------------------
  // Initialize: fetch data + subscribe to realtime
  // --------------------------------------------------------
  initialize: async () => {
    if (!isSupabaseConfigured()) {
      // Offline mode — use seed data
      set({ tasks: SEED_TASKS, logs: SEED_LOGS, isOnline: false, isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const supabase = getSupabaseClient();

      // Fetch tasks
      const { data: taskRows, error: taskErr } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (taskErr) throw taskErr;

      // Fetch logs
      const { data: logRows, error: logErr } = await supabase
        .from("agent_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (logErr) throw logErr;

      const tasks = (taskRows || []).map(rowToTask);
      const logs = (logRows || []).map(rowToLog);

      set({ tasks, logs, isOnline: true, isLoading: false });

      // ---- Subscribe to realtime changes ----

      // Tasks channel
      tasksChannel = supabase
        .channel("tasks-realtime")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "tasks" },
          (payload) => {
            const newTask = rowToTask(payload.new);
            set((state) => {
              // Avoid duplicates
              if (state.tasks.some((t) => t.id === newTask.id)) return state;
              return { tasks: [newTask, ...state.tasks] };
            });
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "tasks" },
          (payload) => {
            const updated = rowToTask(payload.new);
            set((state) => ({
              tasks: state.tasks.map((t) => (t.id === updated.id ? updated : t)),
            }));
          }
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "tasks" },
          (payload) => {
            const deletedId = (payload.old as { id: string }).id;
            set((state) => ({
              tasks: state.tasks.filter((t) => t.id !== deletedId),
            }));
          }
        )
        .subscribe();

      // Logs channel
      logsChannel = supabase
        .channel("logs-realtime")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "agent_logs" },
          (payload) => {
            const newLog = rowToLog(payload.new);
            set((state) => {
              if (state.logs.some((l) => l.id === newLog.id)) return state;
              return { logs: [newLog, ...state.logs].slice(0, 200) };
            });
          }
        )
        .subscribe();
    } catch (err) {
      console.error("[Store] Init error:", err);
      // Fallback to seed data
      set({
        tasks: SEED_TASKS,
        logs: SEED_LOGS,
        isOnline: false,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to connect",
      });
    }
  },

  // --------------------------------------------------------
  // Cleanup realtime subscriptions
  // --------------------------------------------------------
  cleanup: () => {
    if (tasksChannel) {
      getSupabaseClient().removeChannel(tasksChannel);
      tasksChannel = null;
    }
    if (logsChannel) {
      getSupabaseClient().removeChannel(logsChannel);
      logsChannel = null;
    }
  },

  // --------------------------------------------------------
  // Add task
  // --------------------------------------------------------
  addTask: async (taskData) => {
    if (!get().isOnline) {
      // Offline mode
      const now = new Date().toISOString();
      const task: Task = {
        ...taskData,
        id: genId(),
        createdAt: now,
        updatedAt: now,
        completedAt: null,
      };
      set((state) => ({ tasks: [task, ...state.tasks] }));
      return;
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.from("tasks").insert({
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      priority: taskData.priority,
      tags: taskData.tags,
      assignee: taskData.assignee,
      due_date: taskData.dueDate,
      source: "manual",
    });

    if (error) {
      console.error("[Store] Add task error:", error);
      set({ error: error.message });
    }
    // Realtime will handle adding to state
  },

  // --------------------------------------------------------
  // Update task
  // --------------------------------------------------------
  updateTask: async (id, updates) => {
    if (!get().isOnline) {
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
        ),
      }));
      return;
    }

    const supabase = getSupabaseClient();
    const dbUpdates: Partial<{
      title: string;
      description: string;
      status: string;
      priority: string;
      tags: string[];
      assignee: string | null;
      due_date: string | null;
      completed_at: string | null;
    }> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.assignee !== undefined) dbUpdates.assignee = updates.assignee;
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
    if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;

    const { error } = await supabase
      .from("tasks")
      .update(dbUpdates)
      .eq("id", id);

    if (error) {
      console.error("[Store] Update task error:", error);
      set({ error: error.message });
    }
  },

  // --------------------------------------------------------
  // Delete task
  // --------------------------------------------------------
  deleteTask: async (id) => {
    if (!get().isOnline) {
      set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
      return;
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      console.error("[Store] Delete task error:", error);
      set({ error: error.message });
    }
  },

  // --------------------------------------------------------
  // Move task (drag/drop)
  // --------------------------------------------------------
  moveTask: async (id, newStatus) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    const now = new Date().toISOString();
    const completedAt = newStatus === "done" ? now : null;

    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? { ...t, status: newStatus, updatedAt: now, completedAt }
          : t
      ),
    }));

    if (!get().isOnline) return;

    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("tasks")
      .update({
        status: newStatus,
        completed_at: completedAt,
      })
      .eq("id", id);

    if (error) {
      console.error("[Store] Move task error:", error);
      // Revert optimistic update
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, status: task.status, completedAt: task.completedAt } : t
        ),
        error: error.message,
      }));
      return;
    }

    // Log the move
    await supabase.from("agent_logs").insert({
      agent_name: "System",
      action: `Task moved: ${task.title}`,
      task_id: id,
      details: `${task.status} → ${newStatus}`,
      status: "success",
      event_type: "progress",
    });
  },

  // --------------------------------------------------------
  // Add log (local only — for offline mode)
  // --------------------------------------------------------
  addLog: (logData) => {
    const log: AgentLog = { ...logData, id: genId() };
    set((state) => ({ logs: [log, ...state.logs] }));
  },

  // --------------------------------------------------------
  // Refresh data from Supabase
  // --------------------------------------------------------
  refreshTasks: async () => {
    if (!get().isOnline) return;
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      set({ tasks: data.map(rowToTask) });
    }
  },

  refreshLogs: async () => {
    if (!get().isOnline) return;
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("agent_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!error && data) {
      set({ logs: data.map(rowToLog) });
    }
  },

  // --------------------------------------------------------
  // Compute stats
  // --------------------------------------------------------
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
