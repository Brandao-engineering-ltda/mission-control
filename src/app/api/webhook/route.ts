import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

// ============================================================
// OpenClaw Webhook Handler
// Receives lifecycle events from OpenClaw subagent spawns
// and auto-creates/updates tasks + logs in Supabase
// ============================================================

// Agent label → display name mapping
const AGENT_NAMES: Record<string, string> = {
  developer: "Developer Agent",
  researcher: "Researcher Agent",
  marketer: "Marketer Agent",
  reviewer: "Reviewer Agent",
  ideator: "Ideator Agent",
};

// Known event types from OpenClaw
type EventType = "start" | "end" | "error" | "progress" | "document" | "heartbeat";

interface WebhookPayload {
  event: EventType;
  sessionId: string;
  label?: string;
  task?: string;
  model?: string;
  result?: string;
  error?: string;
  progress?: string;
  document?: {
    title: string;
    path?: string;
    content?: string;
  };
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

// ============================================================
// Priority derivation from task text
// ============================================================
function derivePriority(text: string): string {
  const lower = text.toLowerCase();
  if (
    lower.includes("urgent") ||
    lower.includes("critical") ||
    lower.includes("asap") ||
    lower.includes("breaking") ||
    lower.includes("hotfix")
  ) {
    return "critical";
  }
  if (
    lower.includes("important") ||
    lower.includes("high priority") ||
    lower.includes("blocker") ||
    lower.includes("production")
  ) {
    return "high";
  }
  if (
    lower.includes("nice to have") ||
    lower.includes("low priority") ||
    lower.includes("eventually") ||
    lower.includes("backlog")
  ) {
    return "low";
  }
  return "medium";
}

// ============================================================
// Tag derivation from task text
// ============================================================
function deriveTags(text: string, label?: string): string[] {
  const tags: string[] = [];
  const lower = text.toLowerCase();

  if (lower.includes("api") || lower.includes("endpoint") || lower.includes("route"))
    tags.push("api");
  if (lower.includes("frontend") || lower.includes("ui") || lower.includes("component"))
    tags.push("frontend");
  if (lower.includes("backend") || lower.includes("server") || lower.includes("database"))
    tags.push("backend");
  if (lower.includes("deploy") || lower.includes("ci/cd") || lower.includes("vercel"))
    tags.push("devops");
  if (lower.includes("test") || lower.includes("e2e") || lower.includes("spec"))
    tags.push("testing");
  if (lower.includes("bug") || lower.includes("fix") || lower.includes("error"))
    tags.push("bugfix");
  if (lower.includes("feature") || lower.includes("implement") || lower.includes("build"))
    tags.push("feature");
  if (lower.includes("research") || lower.includes("analyze") || lower.includes("investigate"))
    tags.push("research");
  if (lower.includes("content") || lower.includes("tweet") || lower.includes("thread") || lower.includes("post"))
    tags.push("content");
  if (lower.includes("review") || lower.includes("pr") || lower.includes("code review"))
    tags.push("review");
  if (lower.includes("idea") || lower.includes("brainstorm") || lower.includes("concept"))
    tags.push("ideation");
  if (lower.includes("supabase") || lower.includes("database") || lower.includes("schema"))
    tags.push("database");
  if (lower.includes("auth") || lower.includes("security"))
    tags.push("security");

  if (label) tags.push(label);

  return [...new Set(tags)].slice(0, 6);
}

// ============================================================
// Title extraction — first line or truncated task description
// ============================================================
function deriveTitle(taskText: string): string {
  const firstLine = taskText.split("\n")[0].trim();
  if (firstLine.length <= 80) return firstLine;
  return firstLine.substring(0, 77) + "...";
}

// ============================================================
// POST /api/webhook
// ============================================================
export async function POST(req: NextRequest) {
  try {
    // Optional: verify webhook secret
    const secret = process.env.WEBHOOK_SECRET;
    if (secret) {
      const authHeader = req.headers.get("authorization");
      const providedSecret =
        authHeader?.replace("Bearer ", "") ||
        req.headers.get("x-webhook-secret");
      if (providedSecret !== secret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const payload: WebhookPayload = await req.json();
    const {
      event,
      sessionId,
      label,
      task: taskText,
      model,
      result,
      error: errorMsg,
      progress,
      document: doc,
      metadata,
      timestamp,
    } = payload;

    if (!event || !sessionId) {
      return NextResponse.json(
        { error: "Missing required fields: event, sessionId" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();
    const agentName = AGENT_NAMES[label || ""] || label || "Unknown Agent";
    const now = timestamp || new Date().toISOString();

    // --------------------------------------------------------
    // EVENT: start — create a new task + log
    // --------------------------------------------------------
    if (event === "start" && taskText) {
      const title = deriveTitle(taskText);
      const priority = derivePriority(taskText);
      const tags = deriveTags(taskText, label);

      const { data: newTask, error: taskError } = await supabase
        .from("tasks")
        .insert({
          title,
          description: taskText,
          status: "in_progress",
          priority,
          tags,
          assignee: agentName,
          session_id: sessionId,
          source: "webhook",
          metadata: { model, label, ...metadata },
        })
        .select()
        .single();

      if (taskError) {
        console.error("[Webhook] Task insert error:", taskError);
        return NextResponse.json({ error: taskError.message }, { status: 500 });
      }

      await supabase.from("agent_logs").insert({
        agent_name: agentName,
        action: `Started: ${title}`,
        task_id: newTask.id,
        details: `Model: ${model || "default"} | Priority: ${priority}`,
        status: "info",
        session_id: sessionId,
        event_type: "start",
        metadata: { model, label, tags },
      });

      return NextResponse.json({
        ok: true,
        taskId: newTask.id,
        event: "start",
      });
    }

    // --------------------------------------------------------
    // EVENT: end — mark task as done + log completion
    // --------------------------------------------------------
    if (event === "end") {
      const { data: existingTask } = await supabase
        .from("tasks")
        .select("id, title")
        .eq("session_id", sessionId)
        .neq("status", "done")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (existingTask) {
        await supabase
          .from("tasks")
          .update({
            status: "done",
            completed_at: now,
            metadata: { result: result?.substring(0, 2000), ...metadata },
          })
          .eq("id", existingTask.id);

        await supabase.from("agent_logs").insert({
          agent_name: agentName,
          action: `Completed: ${existingTask.title}`,
          task_id: existingTask.id,
          details: result?.substring(0, 500) || "Task completed successfully",
          status: "success",
          session_id: sessionId,
          event_type: "end",
        });

        return NextResponse.json({
          ok: true,
          taskId: existingTask.id,
          event: "end",
        });
      }

      await supabase.from("agent_logs").insert({
        agent_name: agentName,
        action: `Session completed`,
        details: result?.substring(0, 500) || "Session ended",
        status: "success",
        session_id: sessionId,
        event_type: "end",
      });

      return NextResponse.json({ ok: true, event: "end", taskId: null });
    }

    // --------------------------------------------------------
    // EVENT: error — mark task for review + log error
    // --------------------------------------------------------
    if (event === "error") {
      const { data: existingTask } = await supabase
        .from("tasks")
        .select("id, title")
        .eq("session_id", sessionId)
        .neq("status", "done")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (existingTask) {
        await supabase
          .from("tasks")
          .update({
            status: "review",
            metadata: { error: errorMsg, ...metadata },
          })
          .eq("id", existingTask.id);

        await supabase.from("agent_logs").insert({
          agent_name: agentName,
          action: `Error: ${existingTask.title}`,
          task_id: existingTask.id,
          details: errorMsg || "Unknown error",
          status: "error",
          session_id: sessionId,
          event_type: "error",
        });

        return NextResponse.json({
          ok: true,
          taskId: existingTask.id,
          event: "error",
        });
      }

      await supabase.from("agent_logs").insert({
        agent_name: agentName,
        action: `Error in session`,
        details: errorMsg || "Unknown error",
        status: "error",
        session_id: sessionId,
        event_type: "error",
      });

      return NextResponse.json({ ok: true, event: "error", taskId: null });
    }

    // --------------------------------------------------------
    // EVENT: progress — update task + log progress
    // --------------------------------------------------------
    if (event === "progress") {
      const { data: existingTask } = await supabase
        .from("tasks")
        .select("id, title, metadata")
        .eq("session_id", sessionId)
        .neq("status", "done")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (existingTask) {
        const existingMeta = (existingTask.metadata || {}) as Record<string, unknown>;
        await supabase
          .from("tasks")
          .update({
            metadata: {
              ...existingMeta,
              lastProgress: progress,
              lastProgressAt: now,
            },
          })
          .eq("id", existingTask.id);

        await supabase.from("agent_logs").insert({
          agent_name: agentName,
          action: `Progress: ${existingTask.title}`,
          task_id: existingTask.id,
          details: progress || "Progress update",
          status: "info",
          session_id: sessionId,
          event_type: "progress",
        });

        return NextResponse.json({
          ok: true,
          taskId: existingTask.id,
          event: "progress",
        });
      }

      return NextResponse.json({ ok: true, event: "progress", taskId: null });
    }

    // --------------------------------------------------------
    // EVENT: document — log artifact creation
    // --------------------------------------------------------
    if (event === "document" && doc) {
      const { data: existingTask } = await supabase
        .from("tasks")
        .select("id, title")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      await supabase.from("agent_logs").insert({
        agent_name: agentName,
        action: `Document: ${doc.title}`,
        task_id: existingTask?.id || null,
        details: doc.path
          ? `Created ${doc.path}`
          : doc.content?.substring(0, 300) || "Document created",
        status: "success",
        session_id: sessionId,
        event_type: "document",
        metadata: { document: { title: doc.title, path: doc.path } },
      });

      return NextResponse.json({
        ok: true,
        taskId: existingTask?.id || null,
        event: "document",
      });
    }

    // --------------------------------------------------------
    // EVENT: heartbeat — just log, no task mutation
    // --------------------------------------------------------
    if (event === "heartbeat") {
      return NextResponse.json({ ok: true, event: "heartbeat" });
    }

    // Unknown event — log it
    await supabase.from("agent_logs").insert({
      agent_name: agentName,
      action: `Unknown event: ${event}`,
      details: JSON.stringify(payload).substring(0, 500),
      status: "warning",
      session_id: sessionId,
      event_type: event,
    });

    return NextResponse.json({ ok: true, event });
  } catch (err) {
    console.error("[Webhook] Unhandled error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/webhook — health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "mission-control-webhook",
    events: ["start", "end", "error", "progress", "document", "heartbeat"],
  });
}
