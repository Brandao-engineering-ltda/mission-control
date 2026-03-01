"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, WifiOff, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TaskCard } from "./task-card";
import { COLUMNS, TaskStatus } from "@/lib/types";
import { useStore } from "@/lib/store";

export function KanbanBoard() {
  const tasks = useStore((s) => s.tasks);
  const addTask = useStore((s) => s.addTask);
  const moveTask = useStore((s) => s.moveTask);
  const isOnline = useStore((s) => s.isOnline);
  const isLoading = useStore((s) => s.isLoading);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

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

  // Drag handlers
  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
    setDraggingTaskId(taskId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, columnId: TaskStatus) => {
      e.preventDefault();
      const taskId = e.dataTransfer.getData("text/plain");
      if (taskId) {
        const task = tasks.find((t) => t.id === taskId);
        if (task && task.status !== columnId) {
          moveTask(taskId, columnId);
        }
      }
      setDragOverColumn(null);
      setDraggingTaskId(null);
    },
    [tasks, moveTask]
  );

  const handleDragEnd = useCallback(() => {
    setDragOverColumn(null);
    setDraggingTaskId(null);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading tasks...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Connection status indicator */}
      <div className="flex items-center gap-1.5 mb-3">
        {isOnline ? (
          <div className="flex items-center gap-1 text-[10px] text-emerald-400">
            <Wifi className="h-3 w-3" />
            <span>Live</span>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[10px] text-amber-400">
            <WifiOff className="h-3 w-3" />
            <span>Offline (demo mode)</span>
          </div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-4 overflow-x-auto pb-4"
      >
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.id);
          const isDragOver = dragOverColumn === column.id;

          return (
            <div
              key={column.id}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id as TaskStatus)}
              className={`flex-shrink-0 w-[280px] rounded-xl border backdrop-blur-sm transition-all duration-200 ${
                isDragOver
                  ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20"
                  : "bg-muted/30 border-border/50"
              }`}
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
                      <TaskCard
                        key={task.id}
                        task={task}
                        isDragging={draggingTaskId === task.id}
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                      />
                    ))}
                  </AnimatePresence>
                  {columnTasks.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`text-center py-8 text-xs ${
                        isDragOver
                          ? "text-primary/60"
                          : "text-muted-foreground/50"
                      }`}
                    >
                      {isDragOver ? "Drop here" : "No tasks"}
                    </motion.div>
                  )}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
