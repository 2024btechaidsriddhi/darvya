import React from 'react';
import { motion } from 'motion/react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'emerald' | 'amber' | 'orange' | 'rose' | 'indigo' | 'cyan' | 'slate';
  id?: string;
}

export default function GlassCard({ children, className = '', id }: GlassCardProps) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-lg border border-slate-800 bg-slate-900/40 px-6 py-5 select-none 
                  shadow-sm hover:border-slate-700 transition-all duration-200 ${className}`}
    >
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
