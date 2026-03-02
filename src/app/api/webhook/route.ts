import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

// ============================================================
// OpenClaw Webhook Handler
// Receives lifecycle events from OpenClaw hook handler
// and auto-creates/updates tasks + logs in Supabase
// ============================================================

// Agent label → display name mapping
const AGENT_NAMES: Record<string, string> = {
  developer: "Developer Agent",
  researcher: "Researcher Agent",
  marketer: "Marketer Agent",
  reviewer: "Reviewer Agent",
  ideator: "Ideator Agent",
  main: "Maximo",
};

// Known actions from the hook handler
type ActionType = "start" | "end" | "error" | "progress" | "document";

interface WebhookPayload {
  // Hook handler sends `action`, legacy format uses `event`
  action?: ActionType;
  event?: ActionType;
  runId: string;
  sessionKey: string;
  timestamp?: string;
  // start event
  prompt?: string | null;
  source?: string | null;
  // end event
  response?: string | null;
  // error event
  error?: string | null;
  // progress event
  message?: string | null;
  // document event
  agentId?: string | null;
  document?: {
    title: string;
    content?: string;
    type?: string;
    path?: string;
  } | null;
  // generic
  eventType?: string;
  metadata?: Record<string, unknown>;
  // Legacy fields (from old format)
  label?: string;
  task?: string;
  model?: string;
  result?: string;
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
function deriveTags(text: string, label?: string | null): string[] {
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
// Derive agent name from sessionKey or label
// ============================================================
function deriveAgentName(sessionKey: string, label?: string | null): string {
  // If label provided, use it
  if (label && AGENT_NAMES[label]) return AGENT_NAMES[label];
  if (label) return label.charAt(0).toUpperCase() + label.slice(1) + " Agent";

  // Try to extract from sessionKey format: "agent:main:subagent:uuid" or "agent:main:main"
  const parts = sessionKey.split(":");
  if (parts.length >= 2) {
    const agentId = parts[1]; // "main", "developer", etc.
    if (AGENT_NAMES[agentId]) return AGENT_NAMES[agentId];
  }
  // Check for subagent label in session key
  if (parts.length >= 3 && parts[2] === "subagent") {
    // Subagent — we don't know the label from the key alone
    return "Subagent";
  }

  return "Unknown Agent";
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

    // Normalize: hook handler sends `action`, legacy sends `event`
    const action = (payload.action || payload.event) as ActionType | undefined;
    const sessionKey = payload.sessionKey || "";
    const runId = payload.runId || "";

    if (!action || !sessionKey) {
      return NextResponse.json(
        { error: "Missing required fields: action/event, sessionKey" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseServer();
    const agentName = deriveAgentName(sessionKey, payload.label);
    const now = payload.timestamp || new Date().toISOString();

    // --------------------------------------------------------
    // ACTION: start — create a new task + log
    // --------------------------------------------------------
    if (action === "start") {
      const taskText = payload.prompt || payload.task || "";
      if (!taskText) {
        // No prompt — just log the start
        await supabase.from("agent_logs").insert({
          agent_name: agentName,
          action: "Session started",
          details: `Source: ${payload.source || "unknown"}`,
          status: "info",
          session_id: runId || sessionKey,
          event_type: "start",
          metadata: { runId, source: payload.source },
        });
        return NextResponse.json({ ok: true, event: "start", taskId: null });
      }

      const title = deriveTitle(taskText);
      const priority = derivePriority(taskText);
      const tags = deriveTags(taskText, payload.label);

      const { data: newTask, error: taskError } = await supabase
        .from("tasks")
        .insert({
          title,
          description: taskText,
          status: "in_progress",
          priority,
          tags,
          assignee: agentName,
          session_id: runId || sessionKey,
          source: "webhook",
          metadata: {
            runId,
            source: payload.source,
            label: payload.label,
            model: payload.model,
            ...(payload.metadata || {}),
          },
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
        details: `Source: ${payload.source || "direct"} | Priority: ${priority}`,
        status: "info",
        session_id: runId || sessionKey,
        event_type: "start",
        metadata: { runId, tags, source: payload.source },
      });

      return NextResponse.json({
        ok: true,
        taskId: newTask.id,
        event: "start",
      });
    }

    // --------------------------------------------------------
    // ACTION: end — mark task as done + log completion
    // --------------------------------------------------------
    if (action === "end") {
      // Find task by runId first, then by sessionKey
      let existingTask = null;

      if (runId) {
        const { data } = await supabase
          .from("tasks")
          .select("id, title")
          .eq("session_id", runId)
          .neq("status", "done")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        existingTask = data;
      }

      if (!existingTask) {
        const { data } = await supabase
          .from("tasks")
          .select("id, title")
          .eq("session_id", sessionKey)
          .neq("status", "done")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        existingTask = data;
      }

      const responseText = payload.response || payload.result || null;

      if (existingTask) {
        await supabase
          .from("tasks")
          .update({
            status: "done",
            completed_at: now,
            metadata: {
              response: responseText?.substring(0, 2000),
              ...(payload.metadata || {}),
            },
          })
          .eq("id", existingTask.id);

        await supabase.from("agent_logs").insert({
          agent_name: agentName,
          action: `Completed: ${existingTask.title}`,
          task_id: existingTask.id,
          details: responseText?.substring(0, 500) || "Task completed successfully",
          status: "success",
          session_id: runId || sessionKey,
          event_type: "end",
        });

        return NextResponse.json({
          ok: true,
          taskId: existingTask.id,
          event: "end",
        });
      }

      // No matching task — just log it
      await supabase.from("agent_logs").insert({
        agent_name: agentName,
        action: "Session completed",
        details: responseText?.substring(0, 500) || "Session ended",
        status: "success",
        session_id: runId || sessionKey,
        event_type: "end",
      });

      return NextResponse.json({ ok: true, event: "end", taskId: null });
    }

    // --------------------------------------------------------
    // ACTION: error — mark task for review + log error
    // --------------------------------------------------------
    if (action === "error") {
      let existingTask = null;

      if (runId) {
        const { data } = await supabase
          .from("tasks")
          .select("id, title")
          .eq("session_id", runId)
          .neq("status", "done")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        existingTask = data;
      }

      if (!existingTask) {
        const { data } = await supabase
          .from("tasks")
          .select("id, title")
          .eq("session_id", sessionKey)
          .neq("status", "done")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        existingTask = data;
      }

      const errorMsg = payload.error || "Unknown error";

      if (existingTask) {
        await supabase
          .from("tasks")
          .update({
            status: "review",
            metadata: { error: errorMsg, ...(payload.metadata || {}) },
          })
          .eq("id", existingTask.id);

        await supabase.from("agent_logs").insert({
          agent_name: agentName,
          action: `Error: ${existingTask.title}`,
          task_id: existingTask.id,
          details: errorMsg,
          status: "error",
          session_id: runId || sessionKey,
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
        action: "Error in session",
        details: errorMsg,
        status: "error",
        session_id: runId || sessionKey,
        event_type: "error",
      });

      return NextResponse.json({ ok: true, event: "error", taskId: null });
    }

    // --------------------------------------------------------
    // ACTION: progress — update task + log progress
    // --------------------------------------------------------
    if (action === "progress") {
      let existingTask = null;

      if (runId) {
        const { data } = await supabase
          .from("tasks")
          .select("id, title, metadata")
          .eq("session_id", runId)
          .neq("status", "done")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        existingTask = data;
      }

      if (!existingTask) {
        const { data } = await supabase
          .from("tasks")
          .select("id, title, metadata")
          .eq("session_id", sessionKey)
          .neq("status", "done")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        existingTask = data;
      }

      const progressMsg = payload.message || "Progress update";

      if (existingTask) {
        const existingMeta = (existingTask.metadata || {}) as Record<string, unknown>;
        await supabase
          .from("tasks")
          .update({
            metadata: {
              ...existingMeta,
              lastProgress: progressMsg,
              lastProgressAt: now,
            },
          })
          .eq("id", existingTask.id);

        await supabase.from("agent_logs").insert({
          agent_name: agentName,
          action: `Progress: ${existingTask.title}`,
          task_id: existingTask.id,
          details: progressMsg,
          status: "info",
          session_id: runId || sessionKey,
          event_type: "progress",
        });

        return NextResponse.json({
          ok: true,
          taskId: existingTask.id,
          event: "progress",
        });
      }

      // No matching task — just log
      await supabase.from("agent_logs").insert({
        agent_name: agentName,
        action: "Progress update",
        details: progressMsg,
        status: "info",
        session_id: runId || sessionKey,
        event_type: "progress",
      });

      return NextResponse.json({ ok: true, event: "progress", taskId: null });
    }

    // --------------------------------------------------------
    // ACTION: document — log artifact creation
    // --------------------------------------------------------
    if (action === "document" && payload.document) {
      const doc = payload.document;
      let existingTask = null;

      if (runId) {
        const { data } = await supabase
          .from("tasks")
          .select("id, title")
          .eq("session_id", runId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        existingTask = data;
      }

      if (!existingTask) {
        const { data } = await supabase
          .from("tasks")
          .select("id, title")
          .eq("session_id", sessionKey)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        existingTask = data;
      }

      await supabase.from("agent_logs").insert({
        agent_name: agentName,
        action: `📄 ${doc.title}`,
        task_id: existingTask?.id || null,
        details: doc.path
          ? `Created ${doc.path} (${doc.type || "file"})`
          : doc.content?.substring(0, 300) || "Document created",
        status: "success",
        session_id: runId || sessionKey,
        event_type: "document",
        metadata: {
          document: {
            title: doc.title,
            path: doc.path,
            type: doc.type,
          },
        },
      });

      return NextResponse.json({
        ok: true,
        taskId: existingTask?.id || null,
        event: "document",
      });
    }

    // Unknown action — log it
    await supabase.from("agent_logs").insert({
      agent_name: agentName,
      action: `Unknown: ${action}`,
      details: JSON.stringify(payload).substring(0, 500),
      status: "warning",
      session_id: runId || sessionKey,
      event_type: String(action),
    });

    return NextResponse.json({ ok: true, event: action });
  } catch (err) {
    console.error("[Webhook] Unhandled error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// GET /api/webhook — health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "mission-control-webhook",
    version: "2.0",
    actions: ["start", "end", "error", "progress", "document"],
    format: "Accepts both { action } and { event } field names",
  });
}
