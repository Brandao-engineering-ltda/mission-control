"use client";

import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  Bot,
  Activity,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

const statusIcons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const statusColors = {
  success: "text-green-400",
  error: "text-red-400",
  info: "text-blue-400",
  warning: "text-amber-400",
};

export function AgentActivity() {
  const logs = useStore((s) => s.logs);
  const isOnline = useStore((s) => s.isOnline);
  const refreshLogs = useStore((s) => s.refreshLogs);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Agent Activity
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
              {logs.length}
            </Badge>
            <div className="flex-1" />
            {isOnline && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => refreshLogs()}
              >
                <RefreshCw className="h-3 w-3 text-muted-foreground" />
              </Button>
            )}
            {isOnline ? (
              <div className="flex items-center gap-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
              </div>
            ) : (
              <WifiOff className="h-3 w-3 text-amber-400" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-380px)]">
            <div className="px-4 pb-4 space-y-1">
              <AnimatePresence initial={false}>
                {logs.map((log) => {
                  const Icon = statusIcons[log.status as keyof typeof statusIcons] || Info;
                  const color = statusColors[log.status as keyof typeof statusColors] || "text-blue-400";
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: "auto" }}
                      exit={{ opacity: 0, x: 10, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-start gap-3 py-2.5 border-b border-border/30 last:border-0"
                    >
                      <div className="mt-0.5">
                        <Icon className={`h-4 w-4 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-medium text-foreground flex items-center gap-1">
                            <Bot className="h-3 w-3 text-muted-foreground" />
                            {log.agentName}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(log.timestamp), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-foreground/80">{log.action}</p>
                        {log.details && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                            {log.details}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {logs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground/50 text-xs">
                  No activity yet
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}
