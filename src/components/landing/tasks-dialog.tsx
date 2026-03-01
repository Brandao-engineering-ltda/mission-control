"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, ArrowRight, Zap, AlertCircle } from "lucide-react";
import { useStore } from "@/lib/store";
import { PRIORITY_CONFIG } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface TasksDialogProps {
  open: boolean;
  onClose: () => void;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const dialogVariants = {
  hidden: {
    opacity: 0,
    scale: 0.85,
    y: 40,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      damping: 25,
      stiffness: 300,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: {
      duration: 0.2,
      ease: "easeIn" as const,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.15 + i * 0.07,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
};

function getStatusColor(status: string) {
  switch (status) {
    case "in_progress":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "review":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "todo":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "in_progress":
      return "In Progress";
    case "review":
      return "In Review";
    case "todo":
      return "To Do";
    default:
      return status;
  }
}

export function TasksDialog({ open, onClose }: TasksDialogProps) {
  const tasks = useStore((s) => s.tasks);

  // Show in-progress, review, and todo tasks (active work)
  const activeTasks = tasks.filter(
    (t) => t.status === "in_progress" || t.status === "review" || t.status === "todo"
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Dialog */}
          <motion.div
            className="relative w-full max-w-lg max-h-[80vh] overflow-hidden rounded-2xl border border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl shadow-violet-500/10"
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <motion.div
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500/20"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Zap className="h-4 w-4 text-violet-400" />
                </motion.div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Active Tasks
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {activeTasks.length} task{activeTasks.length !== 1 ? "s" : ""} in progress
                  </p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </motion.button>
            </div>

            {/* Task list */}
            <div className="overflow-y-auto max-h-[60vh] p-4 space-y-2">
              {activeTasks.length === 0 ? (
                <motion.div
                  className="flex flex-col items-center justify-center py-12 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <AlertCircle className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground/60">
                    No active tasks right now
                  </p>
                  <p className="text-xs text-muted-foreground/40 mt-1">
                    All caught up! 🎉
                  </p>
                </motion.div>
              ) : (
                activeTasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    custom={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="group rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] p-4 transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 ${getStatusColor(task.status)}`}
                          >
                            {getStatusLabel(task.status)}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 ${PRIORITY_CONFIG[task.priority].badge}`}
                          >
                            {PRIORITY_CONFIG[task.priority].label}
                          </Badge>
                        </div>
                        <h3 className="text-sm font-medium text-foreground/90 truncate">
                          {task.title}
                        </h3>
                        <p className="text-xs text-muted-foreground/60 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-violet-400 transition-colors shrink-0 mt-1" />
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-3 mt-3 pt-2 border-t border-white/5">
                      {task.assignee && (
                        <span className="text-[10px] text-muted-foreground/50">
                          {task.assignee}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground/50 ml-auto">
                          <Clock className="h-3 w-3" />
                          {new Date(task.dueDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Bottom gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background/95 to-transparent pointer-events-none" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
