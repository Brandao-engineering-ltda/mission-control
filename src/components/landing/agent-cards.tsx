"use client";

import { motion } from "framer-motion";
import { Code2, Search, Megaphone, CheckCircle, Lightbulb } from "lucide-react";
import { useStore } from "@/lib/store";

const agents = [
  {
    name: "Developer",
    label: "Developer Agent",
    icon: Code2,
    color: "from-violet-500 to-purple-600",
    borderColor: "border-violet-500/30",
    bgColor: "bg-violet-500/10",
    textColor: "text-violet-300",
    description: "Builds & ships code",
  },
  {
    name: "Researcher",
    label: "Researcher Agent",
    icon: Search,
    color: "from-cyan-500 to-blue-600",
    borderColor: "border-cyan-500/30",
    bgColor: "bg-cyan-500/10",
    textColor: "text-cyan-300",
    description: "Deep dives & analysis",
  },
  {
    name: "Marketer",
    label: "Marketer Agent",
    icon: Megaphone,
    color: "from-orange-500 to-red-600",
    borderColor: "border-orange-500/30",
    bgColor: "bg-orange-500/10",
    textColor: "text-orange-300",
    description: "Growth & content",
  },
  {
    name: "Reviewer",
    label: "Reviewer Agent",
    icon: CheckCircle,
    color: "from-emerald-500 to-green-600",
    borderColor: "border-emerald-500/30",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-300",
    description: "Quality & feedback",
  },
  {
    name: "Ideator",
    label: "Ideator Agent",
    icon: Lightbulb,
    color: "from-amber-500 to-yellow-600",
    borderColor: "border-amber-500/30",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-300",
    description: "Ideas & innovation",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.8 + i * 0.1,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
};

interface AgentCardsProps {
  onAgentClick: () => void;
}

export function AgentCards({ onAgentClick }: AgentCardsProps) {
  const tasks = useStore((s) => s.tasks);

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        {agents.map((agent, i) => {
          // Live task counts per agent
          const agentTasks = tasks.filter((t) => t.assignee === agent.label);
          const activeTasks = agentTasks.filter(
            (t) => t.status === "in_progress" || t.status === "review"
          );
          const doneTasks = agentTasks.filter((t) => t.status === "done");

          return (
            <motion.button
              key={agent.name}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={onAgentClick}
              className={`relative group rounded-xl border ${agent.borderColor} ${agent.bgColor} p-4 sm:p-5 cursor-pointer transition-colors duration-300 hover:border-opacity-60 backdrop-blur-sm`}
            >
              {/* Gradient top bar */}
              <div
                className={`absolute top-0 left-3 right-3 h-[2px] bg-gradient-to-r ${agent.color} rounded-full opacity-60 group-hover:opacity-100 transition-opacity`}
              />

              {/* Active indicator */}
              {activeTasks.length > 0 && (
                <div className="absolute top-2 right-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className={`${agent.textColor} mb-3`}>
                <agent.icon className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>

              {/* Name */}
              <h3 className="text-sm sm:text-base font-semibold text-foreground/90 mb-1">
                {agent.name}
              </h3>

              {/* Description */}
              <p className="text-[10px] sm:text-xs text-muted-foreground/70 leading-tight">
                {agent.description}
              </p>

              {/* Live stats */}
              {agentTasks.length > 0 && (
                <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground/50">
                  {activeTasks.length > 0 && (
                    <span className="text-yellow-400/70">
                      {activeTasks.length} active
                    </span>
                  )}
                  {doneTasks.length > 0 && (
                    <span className="text-green-400/70">
                      {doneTasks.length} done
                    </span>
                  )}
                </div>
              )}

              {/* Hover glow */}
              <div
                className={`absolute inset-0 rounded-xl bg-gradient-to-br ${agent.color} opacity-0 group-hover:opacity-[0.05] transition-opacity duration-300`}
              />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
