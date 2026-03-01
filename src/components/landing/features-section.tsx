"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Kanban,
  Bot,
  BarChart3,
  Workflow,
  Clock,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Kanban,
    title: "Kanban Board",
    description:
      "Drag-and-drop task management with real-time status tracking across backlog, todo, in-progress, review, and done.",
    gradient: "from-blue-500 to-cyan-500",
    glow: "bg-blue-500/20",
  },
  {
    icon: Bot,
    title: "Agent Integration",
    description:
      "Monitor AI agents in real-time. See what they're working on, their logs, and task assignments.",
    gradient: "from-violet-500 to-purple-500",
    glow: "bg-violet-500/20",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Track velocity, completion rates, and burndown charts. Data-driven insights for your workflow.",
    gradient: "from-emerald-500 to-green-500",
    glow: "bg-emerald-500/20",
  },
  {
    icon: Workflow,
    title: "Automation",
    description:
      "Automated task routing, priority escalation, and agent assignment based on workload and expertise.",
    gradient: "from-orange-500 to-amber-500",
    glow: "bg-orange-500/20",
  },
  {
    icon: Clock,
    title: "Real-time Updates",
    description:
      "Powered by Supabase Realtime. Every change syncs instantly across all connected clients.",
    gradient: "from-pink-500 to-rose-500",
    glow: "bg-pink-500/20",
  },
  {
    icon: Globe,
    title: "Deploy Anywhere",
    description:
      "Optimized for Vercel Edge. Lightning-fast globally with zero-config deployments.",
    gradient: "from-indigo-500 to-blue-500",
    glow: "bg-indigo-500/20",
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative"
    >
      <div className="relative p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.15] transition-all duration-500 h-full">
        {/* Glow effect on hover */}
        <div
          className={`absolute -inset-px rounded-2xl ${feature.glow} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`}
        />

        <div className="relative z-10">
          <div
            className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4`}
          >
            <feature.icon className="h-5 w-5 text-white" />
          </div>

          <h3 className="text-lg font-semibold text-foreground mb-2">
            {feature.title}
          </h3>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {feature.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-32 px-4" ref={ref}>
      {/* Section header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-muted-foreground mb-4"
        >
          Features
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4"
        >
          Everything you need to{" "}
          <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            ship faster
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-muted-foreground text-lg"
        >
          Built for teams that leverage AI agents. From task management to
          deployment, all in one place.
        </motion.p>
      </div>

      {/* Feature grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <FeatureCard key={feature.title} feature={feature} index={i} />
        ))}
      </div>
    </section>
  );
}
