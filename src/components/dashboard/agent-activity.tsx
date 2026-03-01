"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  XCircle,
  Info,
  Bot,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";

const statusIcons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const statusColors = {
  success: "text-green-400",
  error: "text-red-400",
  info: "text-blue-400",
};

export function AgentActivity() {
  const logs = useStore((s) => s.logs);

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
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-380px)]">
            <div className="px-4 pb-4 space-y-1">
              {logs.map((log, i) => {
                const Icon = statusIcons[log.status];
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 py-2.5 border-b border-border/30 last:border-0"
                  >
                    <div className="mt-0.5">
                      <Icon
                        className={`h-4 w-4 ${statusColors[log.status]}`}
                      />
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
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {log.details}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}
