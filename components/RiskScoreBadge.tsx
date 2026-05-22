"use client";

import React from "react";
import { RiskLevel } from "../types/analysis";

interface RiskScoreBadgeProps {
  score: number;
  level: RiskLevel;
}

const LEVEL_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  SAFE:     { color: "#a7ffeb", bg: "bg-teal",      label: "SAFE"     },
  LOW:      { color: "#a7ffeb", bg: "bg-teal",      label: "LOW RISK" },
  MEDIUM:   { color: "#ffe082", bg: "bg-yellow",    label: "MEDIUM"   },
  HIGH:     { color: "#ff8a80", bg: "bg-coral",     label: "HIGH RISK" },
  CRITICAL: { color: "#ff8a80", bg: "bg-coral",     label: "CRITICAL" },
};

export default function RiskScoreBadge({ score, level }: RiskScoreBadgeProps) {
  const cfg = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.MEDIUM;
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div
      className="flex flex-col items-center justify-center p-6 border-3 border-[#1a1a1a] bg-[#ffffff] neo-shadow print-card"
      style={{ minWidth: 180 }}
    >
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 absolute inset-0" viewBox="0 0 160 160">
          {/* Track */}
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#f5f4f0" strokeWidth="12" />
          {/* Progress */}
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="12"
            strokeLinecap="square"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)",
            }}
          />
        </svg>

        {/* Flat color fill inner center */}
        <div className={`absolute inset-4 rounded-full border-2 border-[#1a1a1a] ${cfg.bg}`} />

        <div className="relative flex flex-col items-center z-10">
          <span className="text-4xl font-black leading-none text-[#1a1a1a] font-sans">
            {score}
          </span>
          <span className="text-[10px] font-black uppercase text-[#1a1a1a] tracking-wider mt-0.5 font-mono">
            / 100
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-1.5 w-full">
        <span className="text-[10px] font-black tracking-widest uppercase font-mono text-[#555555]">
          Risk Level
        </span>
        <span className={`px-4 py-1.5 border-2 border-[#1a1a1a] text-xs font-black tracking-widest uppercase text-[#1a1a1a] rounded-none ${cfg.bg} w-full text-center neo-shadow-sm`}>
          {cfg.label}
        </span>
      </div>
    </div>
  );
}
