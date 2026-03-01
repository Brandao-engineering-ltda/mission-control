"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MissionLogo } from "@/components/landing/mission-logo";
import { AgentCards } from "@/components/landing/agent-cards";
import { TasksDialog } from "@/components/landing/tasks-dialog";
import { Header } from "@/components/dashboard/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { KanbanBoard } from "@/components/dashboard/kanban-board";
import { AgentActivity } from "@/components/dashboard/agent-activity";
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, Kanban, BarChart3, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

function LandingPage({
  onEnterDashboard,
}: {
  onEnterDashboard: () => void;
}) {
  const [tasksOpen, setTasksOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="h-screen bg-background flex flex-col items-center relative overflow-hidden"
    >
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Top gradient fade */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent z-10" />

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />

      {/* Main content — fills exactly 100vh, no scroll */}
      <div className="relative z-20 flex flex-col items-center w-full h-full py-6 sm:py-8">
        {/* Title — pinned to top */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-center mb-1"
        >
          <span className="bg-gradient-to-b from-white via-white/90 to-white/50 bg-clip-text text-transparent">
            Mission{" "}
          </span>
          <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
            Control
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-xs sm:text-sm text-muted-foreground/60 mb-4 sm:mb-6"
        >
          AI Agent Orchestration Hub
        </motion.p>

        {/* Logo — centered in remaining space */}
        <div className="flex-1 flex items-center justify-center min-h-0">
          <MissionLogo onClick={() => setTasksOpen(true)} />
        </div>

        {/* Agent cards — pinned to bottom */}
        <div className="pt-4 sm:pt-6 pb-2">
          <AgentCards onAgentClick={onEnterDashboard} />
        </div>
      </div>

      {/* Tasks dialog */}
      <TasksDialog open={tasksOpen} onClose={() => setTasksOpen(false)} />
    </motion.div>
  );
}

function Dashboard({ onBack }: { onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.02 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Button>
        </div>

        <Header />

        <div className="space-y-6 pb-8">
          <StatsCards />

          <Tabs defaultValue="kanban" className="w-full">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="kanban" className="gap-1.5 text-xs">
                <Kanban className="h-3.5 w-3.5" />
                Kanban
              </TabsTrigger>
              <TabsTrigger value="overview" className="gap-1.5 text-xs">
                <LayoutGrid className="h-3.5 w-3.5" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-1.5 text-xs">
                <BarChart3 className="h-3.5 w-3.5" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="kanban" className="mt-4">
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
                <KanbanBoard />
                <AgentActivity />
              </div>
            </TabsContent>

            <TabsContent value="overview" className="mt-4">
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
                <KanbanBoard />
                <AgentActivity />
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-4">
              <AnalyticsCharts />
              <div className="mt-4">
                <AgentActivity />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
}

export default function Page() {
  const [view, setView] = useState<"landing" | "dashboard">("landing");

  return (
    <AnimatePresence mode="wait">
      {view === "landing" ? (
        <LandingPage
          key="landing"
          onEnterDashboard={() => setView("dashboard")}
        />
      ) : (
        <Dashboard
          key="dashboard"
          onBack={() => setView("landing")}
        />
      )}
    </AnimatePresence>
  );
}
