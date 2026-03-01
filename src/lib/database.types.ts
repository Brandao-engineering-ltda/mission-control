// Generated types for Supabase schema — keep in sync with supabase/schema.sql

export type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "critical";
export type TaskSource = "manual" | "webhook" | "auto";
export type LogStatus = "success" | "error" | "info" | "warning";

export interface TaskRow {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  assignee: string | null;
  due_date: string | null;
  completed_at: string | null;
  session_id: string | null;
  source: TaskSource;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TaskInsert {
  id?: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  tags?: string[];
  assignee?: string | null;
  due_date?: string | null;
  completed_at?: string | null;
  session_id?: string | null;
  source?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface TaskUpdate {
  id?: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  tags?: string[];
  assignee?: string | null;
  due_date?: string | null;
  completed_at?: string | null;
  session_id?: string | null;
  source?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface AgentLogRow {
  id: string;
  agent_name: string;
  action: string;
  task_id: string | null;
  details: string;
  status: LogStatus;
  session_id: string | null;
  event_type: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AgentLogInsert {
  id?: string;
  agent_name: string;
  action: string;
  task_id?: string | null;
  details?: string;
  status?: string;
  session_id?: string | null;
  event_type?: string | null;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface AgentLogUpdate {
  id?: string;
  agent_name?: string;
  action?: string;
  task_id?: string | null;
  details?: string;
  status?: string;
  session_id?: string | null;
  event_type?: string | null;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

// Supabase Database type — matches GenericSchema requirements
export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: TaskRow;
        Insert: TaskInsert;
        Update: TaskUpdate;
        Relationships: [];
      };
      agent_logs: {
        Row: AgentLogRow;
        Insert: AgentLogInsert;
        Update: AgentLogUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
