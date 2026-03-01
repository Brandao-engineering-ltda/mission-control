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
          className="w-[440px] h-[440px] sm:w-[540px] sm:h-[540px] md:w-[660px] md:h-[660px] rounded-full bg-violet-600/15 blur-[100px]"
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
          className="w-[420px] h-[420px] sm:w-[520px] sm:h-[520px] md:w-[620px] md:h-[620px] rounded-full border border-violet-500/0 group-hover:border-violet-500/20"
          initial={false}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* The logo image — responsive: 400px mobile, 500px tablet, 600px desktop */}
      <div className="relative w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] md:w-[600px] md:h-[600px] mx-auto rounded-full overflow-hidden bg-transparent">
        <Image
          src="/logo.jpg"
          alt="Mission Control"
          fill
          className="object-cover rounded-full drop-shadow-[0_0_60px_rgba(139,92,246,0.4)] group-hover:drop-shadow-[0_0_90px_rgba(139,92,246,0.6)] transition-all duration-500"
          priority
        />
      </div>

      {/* Click hint */}
      <motion.p
        className="text-center text-xs text-muted-foreground/50 mt-6 tracking-widest uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        Click to view tasks
      </motion.p>
    </motion.div>
  );
}
