"use client";

import React from "react";
import { SummaryStats as Stats } from "../types/analysis";

interface SummaryStatsProps {
  stats: Stats;
}

const METRICS = [
  { key: "total_findings", label: "TOTAL",    bg: "bg-[#d2c4fb]" },
  { key: "critical_count", label: "CRITICAL", bg: "bg-[#ff8a80]" },
  { key: "high_count",     label: "HIGH",     bg: "bg-[#ff8a80]/80" },
  { key: "medium_count",   label: "MEDIUM",   bg: "bg-[#ffe082]" },
  { key: "low_count",      label: "LOW",      bg: "bg-[#a7ffeb]" },
] as const;

export default function SummaryStats({ stats }: SummaryStatsProps) {
  return (
    <div className="space-y-4 print-card">
      <p className="text-center text-xs font-black tracking-widest uppercase font-mono text-[#555555]">
        ── Threat Assessment ──
      </p>

      <div className="grid grid-cols-5 gap-4">
        {METRICS.map(({ key, label, bg }) => {
          const count = stats[key];
          const isActive = count > 0;
          return (
            <div
              key={key}
              className={`border-2 border-[#1a1a1a] p-3 text-center transition-all duration-100 cursor-default neo-shadow-sm ${
                isActive ? bg : "bg-[#ffffff] opacity-40"
              }`}
            >
              <span className="text-3xl font-black block font-sans text-[#1a1a1a]">
                {count}
              </span>
              <span className="text-[9px] font-black tracking-widest block mt-1 font-mono text-[#1a1a1a] uppercase">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
