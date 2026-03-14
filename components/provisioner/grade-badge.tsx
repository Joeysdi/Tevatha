// components/provisioner/grade-badge.tsx
// Pure server component — static badge, zero client JS
import { GRADE_META } from "@/lib/provisioner/grading";
import type { GradeLevel } from "@/types/treasury";

interface GradeBadgeProps {
  grade:     GradeLevel;
  composite: number;
  size?:     "sm" | "md" | "lg";
}

export function GradeBadge({ grade, composite, size = "md" }: GradeBadgeProps) {
  const meta  = GRADE_META[grade];
  const sizes = {
    sm: { outer:"px-2 py-0.5", label:"text-[9px]", score:"text-[9px]" },
    md: { outer:"px-2.5 py-1", label:"text-[10px]",score:"text-[11px]" },
    lg: { outer:"px-3 py-1.5", label:"text-[11px]",score:"text-[14px]" },
  };
  const s = sizes[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-mono
                  font-bold tracking-[.06em] border ${s.outer}`}
      style={{ background:meta.bg, color:meta.color, borderColor:meta.border }}
      title={meta.verdict}
    >
      <span className={s.score}>{grade}</span>
      <span
        className={`${s.label} opacity-80`}
        style={{ color: meta.color }}
      >
        {composite}
      </span>
    </span>
  );
}
