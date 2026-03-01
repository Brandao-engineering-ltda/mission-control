"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection({ onEnterDashboard }: { onEnterDashboard: () => void }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-32 px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Glow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-6">
            <Rocket className="h-3 w-3" />
            Ready to launch?
          </div>

          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
            Take the{" "}
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              controls
            </span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Your AI agents are waiting. Enter the dashboard and start orchestrating
            your next mission.
          </p>

          <Button
            size="lg"
            onClick={onEnterDashboard}
            className="bg-violet-600 hover:bg-violet-500 text-white px-10 py-7 text-lg font-semibold rounded-2xl shadow-2xl shadow-violet-600/30 hover:shadow-violet-500/50 transition-all duration-300 group"
          >
            Launch Dashboard
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
