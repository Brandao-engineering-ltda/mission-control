"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/lib/store";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1 },
};

export function StatsCards() {
  const getStats = useStore((s) => s.getStats);
  const stats = getStats();

  const cards = [
    {
      label: "Total Tasks",
      value: stats.totalTasks,
      icon: BarChart3,
      color: "from-blue-500/20 to-blue-600/5",
      iconColor: "text-blue-400",
      borderColor: "border-blue-500/20",
    },
    {
      label: "Completed",
      value: stats.completedTasks,
      icon: CheckCircle2,
      color: "from-green-500/20 to-green-600/5",
      iconColor: "text-green-400",
      borderColor: "border-green-500/20",
    },
    {
      label: "In Progress",
      value: stats.inProgressTasks,
      icon: Clock,
      color: "from-yellow-500/20 to-yellow-600/5",
      iconColor: "text-yellow-400",
      borderColor: "border-yellow-500/20",
    },
    {
      label: "Overdue",
      value: stats.overdueTasks,
      icon: AlertTriangle,
      color: "from-red-500/20 to-red-600/5",
      iconColor: "text-red-400",
      borderColor: "border-red-500/20",
    },
    {
      label: "Completion Rate",
      value: `${stats.completionRate}%`,
      icon: TrendingUp,
      color: "from-purple-500/20 to-purple-600/5",
      iconColor: "text-purple-400",
      borderColor: "border-purple-500/20",
    },
    {
      label: "Done This Week",
      value: stats.tasksCompletedThisWeek,
      icon: Zap,
      color: "from-cyan-500/20 to-cyan-600/5",
      iconColor: "text-cyan-400",
      borderColor: "border-cyan-500/20",
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
    >
      {cards.map((card) => (
        <motion.div key={card.label} variants={item}>
          <Card
            className={`bg-gradient-to-br ${card.color} border ${card.borderColor} backdrop-blur-sm hover:scale-105 transition-transform duration-200`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {card.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {card.label}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
