// components/ui/motion.tsx
"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// ── FadeUp ───────────────────────────────────────────────────────────────────
// Use for: hero sections, page headers, CTA blocks

interface FadeUpProps {
  children: ReactNode;
  delay?:   number;
  className?: string;
}

export function FadeUp({ children, delay = 0, className }: FadeUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── StaggerParent ─────────────────────────────────────────────────────────────
// Use for: card grids, list containers

const staggerParentVariants = {
  hidden:  {},
  visible: (delayChildren: number) => ({
    transition: { staggerChildren: 0.06, delayChildren },
  }),
};

interface StaggerParentProps {
  children:      ReactNode;
  className?:    string;
  delayChildren?: number;
}

export function StaggerParent({
  children,
  className,
  delayChildren = 0,
}: StaggerParentProps) {
  return (
    <motion.div
      variants={staggerParentVariants}
      custom={delayChildren}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── StaggerChild ─────────────────────────────────────────────────────────────
// Must be direct child of StaggerParent

const staggerChildVariants = {
  hidden:  { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

interface StaggerChildProps {
  children:  ReactNode;
  className?: string;
}

export function StaggerChild({ children, className }: StaggerChildProps) {
  return (
    <motion.div variants={staggerChildVariants} className={className}>
      {children}
    </motion.div>
  );
}

// ── FadeIn ────────────────────────────────────────────────────────────────────
// Use for: stat numbers, financial figures only

interface FadeInProps {
  children: ReactNode;
  delay?:   number;
  className?: string;
}

export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.span>
  );
}
