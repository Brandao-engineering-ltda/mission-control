"use client";

import { motion } from "framer-motion";

interface MissionLogoProps {
  onClick: () => void;
}

export function MissionLogo({ onClick }: MissionLogoProps) {
  return (
    <motion.div
      className="relative cursor-pointer select-none group"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Outer glow ring — scaled down to match new logo sizes */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] md:w-[520px] md:h-[520px] rounded-full bg-violet-600/15 blur-[80px]"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Subtle pulse ring on hover */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="w-[310px] h-[310px] sm:w-[410px] sm:h-[410px] md:w-[510px] md:h-[510px] rounded-full border border-violet-500/0 group-hover:border-violet-500/20"
          initial={false}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* The logo image — pure img, no wrapper bg, responsive: 300px mobile, 400px tablet, 500px desktop */}
      <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] mx-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.jpg"
          alt="Mission Control"
          className="w-full h-full object-contain rounded-full drop-shadow-[0_0_60px_rgba(139,92,246,0.4)] group-hover:drop-shadow-[0_0_90px_rgba(139,92,246,0.6)] transition-all duration-500"
        />
      </div>

      {/* Click hint */}
      <motion.p
        className="text-center text-xs text-muted-foreground/50 mt-4 tracking-widest uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        Click to view tasks
      </motion.p>
    </motion.div>
  );
}
