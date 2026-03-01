"use client";

import { motion } from "framer-motion";

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="relative border-t border-white/[0.06] py-8 px-4"
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600" />
          <span className="text-sm font-semibold text-foreground">
            Mission Control
          </span>
          <span className="text-xs text-muted-foreground">by Brandão</span>
        </div>

        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <span>Built with Next.js, Three.js & Supabase</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Powered by OpenClaw</span>
        </div>
      </div>
    </motion.footer>
  );
}
