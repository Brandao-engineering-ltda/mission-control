import { NextResponse } from "next/server";
import { getSupabaseServer, isSupabaseConfigured } from "@/lib/supabase";

// GET /api/status — dashboard health check
export async function GET() {
  const configured = isSupabaseConfigured();

  if (!configured) {
    return NextResponse.json({
      status: "offline",
      supabase: false,
      message: "Supabase not configured — running in demo mode",
      tasks: 0,
      logs: 0,
    });
  }

  try {
    const supabase = getSupabaseServer();

    const [tasksResult, logsResult] = await Promise.all([
      supabase.from("tasks").select("id", { count: "exact", head: true }),
      supabase.from("agent_logs").select("id", { count: "exact", head: true }),
    ]);

    return NextResponse.json({
      status: "online",
      supabase: true,
      tasks: tasksResult.count || 0,
      logs: logsResult.count || 0,
      errors: {
        tasks: tasksResult.error?.message || null,
        logs: logsResult.error?.message || null,
      },
    });
  } catch (err) {
    return NextResponse.json({
      status: "error",
      supabase: true,
      message: err instanceof Error ? err.message : "Unknown error",
    });
  }
}
