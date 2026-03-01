"use client";

import { motion } from "framer-motion";
import Image from "next/image";

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
      {/* Outer glow ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] md:w-[440px] md:h-[440px] rounded-full bg-violet-600/15 blur-[80px]"
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
          className="w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] md:w-[340px] md:h-[340px] rounded-full border border-violet-500/0 group-hover:border-violet-500/30"
          initial={false}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* The logo image */}
      <div className="relative w-[200px] h-[200px] sm:w-[260px] sm:h-[260px] md:w-[320px] md:h-[320px] mx-auto">
        <Image
          src="/logo.jpg"
          alt="Mission Control"
          fill
          className="object-contain drop-shadow-[0_0_40px_rgba(139,92,246,0.3)] group-hover:drop-shadow-[0_0_60px_rgba(139,92,246,0.5)] transition-all duration-500"
          priority
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
