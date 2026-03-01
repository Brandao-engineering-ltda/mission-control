-- Mission Control Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- TASKS TABLE
-- ============================================================
create table if not exists tasks (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  description   text not null default '',
  status        text not null default 'todo'
                  check (status in ('backlog', 'todo', 'in_progress', 'review', 'done')),
  priority      text not null default 'medium'
                  check (priority in ('low', 'medium', 'high', 'critical')),
  tags          text[] not null default '{}',
  assignee      text,                         -- agent label: developer, researcher, etc.
  due_date      timestamptz,
  completed_at  timestamptz,
  -- OpenClaw integration fields
  session_id    text,                         -- OpenClaw session ID that spawned this
  source        text not null default 'manual'
                  check (source in ('manual', 'webhook', 'auto')),
  metadata      jsonb not null default '{}',  -- extra context from webhook payloads
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Index for fast column queries
create index if not exists idx_tasks_status on tasks(status);
create index if not exists idx_tasks_assignee on tasks(assignee);
create index if not exists idx_tasks_session_id on tasks(session_id);

-- ============================================================
-- AGENT_LOGS TABLE
-- ============================================================
create table if not exists agent_logs (
  id          uuid primary key default uuid_generate_v4(),
  agent_name  text not null,
  action      text not null,
  task_id     uuid references tasks(id) on delete set null,
  details     text not null default '',
  status      text not null default 'info'
                check (status in ('success', 'error', 'info', 'warning')),
  -- OpenClaw integration
  session_id  text,
  event_type  text,                           -- start, end, error, progress, document
  metadata    jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create index if not exists idx_agent_logs_task_id on agent_logs(task_id);
create index if not exists idx_agent_logs_agent_name on agent_logs(agent_name);
create index if not exists idx_agent_logs_created_at on agent_logs(created_at desc);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_updated_at
  before update on tasks
  for each row
  execute function update_updated_at();

-- ============================================================
-- ENABLE REALTIME
-- ============================================================
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table agent_logs;

-- ============================================================
-- ROW LEVEL SECURITY (permissive for now — tighten with auth later)
-- ============================================================
alter table tasks enable row level security;
alter table agent_logs enable row level security;

-- Allow all operations for anon/authenticated (MVP — lock down in Phase 2)
create policy "Allow all on tasks" on tasks
  for all using (true) with check (true);

create policy "Allow all on agent_logs" on agent_logs
  for all using (true) with check (true);
