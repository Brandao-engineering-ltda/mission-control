"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { COLUMNS, PRIORITY_CONFIG } from "@/lib/types";

const PIE_COLORS = ["#6b7280", "#3b82f6", "#eab308", "#a855f7", "#22c55e"];

export function AnalyticsCharts() {
  const tasks = useStore((s) => s.tasks);

  // Status distribution
  const statusData = COLUMNS.map((col) => ({
    name: col.title,
    count: tasks.filter((t) => t.status === col.id).length,
  }));

  // Priority distribution
  const priorityData = (["low", "medium", "high", "critical"] as const).map(
    (p) => ({
      name: PRIORITY_CONFIG[p].label,
      count: tasks.filter((t) => t.priority === p).length,
    })
  );

  // Real velocity data — tasks created/completed per day over last 7 days
  const velocityData = useMemo(() => {
    const days: { day: string; created: number; completed: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      const dayStr = date.toLocaleDateString("en-US", { weekday: "short" });

      const created = tasks.filter((t) => {
        const d = new Date(t.createdAt);
        return d >= dayStart && d < dayEnd;
      }).length;

      const completed = tasks.filter((t) => {
        if (!t.completedAt) return false;
        const d = new Date(t.completedAt);
        return d >= dayStart && d < dayEnd;
      }).length;

      days.push({ day: dayStr, created, completed });
    }

    return days;
  }, [tasks]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {/* Status Distribution */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Task Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="count"
              >
                {statusData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {statusData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[i] }}
                />
                {item.name} ({item.count})
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Priority Breakdown */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Priority Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Velocity Chart */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Weekly Velocity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={velocityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="created"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="completed"
                stackId="2"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 justify-center mt-2">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              Created
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Completed
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
