"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Brain, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const GrokLogo3D = dynamic(
  () => import("./grok-logo-3d").then((mod) => ({ default: mod.GrokLogo3D })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] md:h-[600px] flex items-center justify-center">
        <div className="w-[200px] h-[200px] rounded-full bg-violet-600/20 blur-[80px] animate-pulse" />
      </div>
    ),
  }
);

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

export function HeroSection({ onEnterDashboard }: { onEnterDashboard: () => void }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Top gradient fade */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent z-10" />

      {/* 3D Logo */}
      <div className="relative z-20 w-full max-w-3xl mx-auto -mb-16 md:-mb-24">
        <GrokLogo3D />
      </div>

      {/* Text content */}
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto -mt-8">
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-6"
        >
          <Zap className="h-3 w-3" />
          AI-Powered Task Orchestration
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight bg-gradient-to-b from-white via-white/90 to-white/50 bg-clip-text text-transparent leading-[1.1] mb-4"
        >
          Mission
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
            Control
          </span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-lg md:text-xl text-muted-foreground/80 max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          Your command center for AI agent orchestration. Track tasks, monitor agents,
          and ship faster with intelligent automation.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            size="lg"
            onClick={onEnterDashboard}
            className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-6 text-base font-semibold rounded-xl shadow-lg shadow-violet-600/25 hover:shadow-violet-500/40 transition-all duration-300 group"
          >
            Enter Dashboard
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-white/10 hover:bg-white/5 px-8 py-6 text-base rounded-xl"
          >
            View Docs
          </Button>
        </motion.div>
      </div>

      {/* Feature pills */}
      <motion.div
        custom={4}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="relative z-20 flex flex-wrap items-center justify-center gap-3 mt-16 px-4"
      >
        {[
          { icon: Brain, label: "AI Agents" },
          { icon: Activity, label: "Real-time Tracking" },
          { icon: Shield, label: "Secure by Default" },
          { icon: Zap, label: "Blazing Fast" },
        ].map((feature) => (
          <div
            key={feature.label}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-muted-foreground"
          >
            <feature.icon className="h-3.5 w-3.5 text-violet-400" />
            {feature.label}
          </div>
        ))}
      </motion.div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
}
