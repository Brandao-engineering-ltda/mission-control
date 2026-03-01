"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TaskCard } from "./task-card";
import { COLUMNS, TaskStatus } from "@/lib/types";
import { useStore } from "@/lib/store";

export function KanbanBoard() {
  const tasks = useStore((s) => s.tasks);
  const addTask = useStore((s) => s.addTask);

  const handleQuickAdd = (status: TaskStatus) => {
    const title = prompt("Task title:");
    if (!title) return;
    addTask({
      title,
      description: "",
      status,
      priority: "medium",
      tags: [],
      assignee: null,
      dueDate: null,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex gap-4 overflow-x-auto pb-4"
    >
      {COLUMNS.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id);
        return (
          <div
            key={column.id}
            className="flex-shrink-0 w-[280px] bg-muted/30 rounded-xl border border-border/50 backdrop-blur-sm"
          >
            {/* Column Header */}
            <div className="p-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${column.color}`} />
                  <h3 className="text-sm font-semibold text-foreground">
                    {column.title}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="text-[10px] h-5 px-1.5 bg-muted"
                  >
                    {columnTasks.length}
                  </Badge>
                </div>
                <button
                  onClick={() => handleQuickAdd(column.id)}
                  className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Column Body */}
            <ScrollArea className="h-[calc(100vh-380px)]">
              <div className="p-2 space-y-2">
                <AnimatePresence mode="popLayout">
                  {columnTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </AnimatePresence>
                {columnTasks.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-muted-foreground/50 text-xs"
                  >
                    No tasks
                  </motion.div>
                )}
              </div>
            </ScrollArea>
          </div>
        );
      })}
    </motion.div>
  );
}
