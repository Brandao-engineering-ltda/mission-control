"use client";

import { motion } from "framer-motion";
import { Rocket, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateTaskDialog } from "./create-task-dialog";
import { useEffect, useState } from "react";

export function Header() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between py-4"
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
        >
          <Rocket className="h-7 w-7 text-violet-400" />
        </motion.div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Mission Control
          </h1>
          <p className="text-xs text-muted-foreground">
            Brandão Command Center
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <CreateTaskDialog />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDark(!dark)}
          className="h-9 w-9"
        >
          {dark ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </motion.header>
  );
}
