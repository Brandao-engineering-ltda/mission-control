"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  GripVertical,
  Calendar,
  Trash2,
  ChevronRight,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task, TaskStatus, COLUMNS, PRIORITY_CONFIG } from "@/lib/types";
import { useStore } from "@/lib/store";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const moveTask = useStore((s) => s.moveTask);
  const deleteTask = useStore((s) => s.deleteTask);
  const priorityConfig = PRIORITY_CONFIG[task.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      whileHover={{ y: -2 }}
      className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-3 cursor-pointer hover:border-primary/30 transition-colors"
    >
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground/30 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium text-foreground leading-tight truncate">
              {task.title}
            </h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {COLUMNS.filter((c) => c.id !== task.status).map((col) => (
                  <DropdownMenuItem
                    key={col.id}
                    onClick={() => moveTask(task.id, col.id as TaskStatus)}
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${col.color} mr-2`}
                    />
                    Move to {col.title}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => deleteTask(task.id)}
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 h-5 ${priorityConfig.badge}`}
            >
              {priorityConfig.label}
            </Badge>
            {task.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-5 bg-primary/5 border-primary/20"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              {task.dueDate && (
                <span className="flex items-center gap-0.5">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(task.dueDate), "MMM d")}
                </span>
              )}
              {task.assignee && (
                <span className="flex items-center gap-0.5">
                  <User className="h-3 w-3" />
                  {task.assignee.split(" ")[0]}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
