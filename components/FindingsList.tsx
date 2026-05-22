"use client";

import React, { useState } from "react";
import { Finding } from "../types/analysis";
import FindingCard from "./FindingCard";

interface FindingsListProps {
  findings: Finding[];
}

const FILTER_CONFIG: Record<string, { bg: string; label: string }> = {
  ALL:        { bg: "bg-[#d2c4fb]", label: "ALL" },
  CRITICAL:   { bg: "bg-[#ff8a80]", label: "CRITICAL" },
  HIGH:       { bg: "bg-[#ff8a80]/80", label: "HIGH" },
  MEDIUM:     { bg: "bg-[#ffe082]", label: "MEDIUM" },
  LOW:        { bg: "bg-[#a7ffeb]", label: "LOW" },
  NEGOTIABLE: { bg: "bg-[#d2c4fb]", label: "NEGOTIABLE" },
};

const FILTERS = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW", "NEGOTIABLE"] as const;

export default function FindingsList({ findings }: FindingsListProps) {
  const [filter, setFilter] = useState<string>("ALL");

  const filtered = findings.filter((f) => {
    if (f.false_positive) return false;
    if (filter === "ALL")        return true;
    if (filter === "NEGOTIABLE") return f.recommendation === "NEGOTIATE";
    return f.severity === filter;
  });

  const countFor = (f: string) => {
    if (f === "ALL")        return findings.filter((x) => !x.false_positive).length;
    if (f === "NEGOTIABLE") return findings.filter((x) => !x.false_positive && x.recommendation === "NEGOTIATE").length;
    return findings.filter((x) => !x.false_positive && x.severity === f).length;
  };

  return (
    <div className="w-full space-y-6">

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap gap-3 justify-center">
        {FILTERS.map((f) => {
          const cfg = FILTER_CONFIG[f];
          const isActive = filter === f;
          const count   = countFor(f);

          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-2 px-4 py-2 border-2 border-[#1a1a1a] text-[11px] font-black font-mono tracking-wider uppercase transition-all duration-100 ${
                isActive
                  ? `${cfg.bg} translate-y-[-2px] shadow-[3px_3px_0px_0px_#1a1a1a]`
                  : "bg-[#ffffff] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_0px_#1a1a1a] active:translate-y-[1px] active:shadow-[0px_0px_0px_0px_#1a1a1a]"
              }`}
            >
              <span>{cfg.label}</span>
              {count > 0 && (
                <span className="px-1.5 py-0.5 border border-[#1a1a1a] bg-[#ffffff] text-[9px] font-black text-[#1a1a1a]">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Cards ── */}
      <div className="space-y-6">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-[#ffffff] border-2 border-dashed border-[#1a1a1a] p-8 text-xs font-mono font-black uppercase tracking-wider text-[#555555]">
            [ No findings match this filter query ]
          </div>
        ) : (
          filtered.map((finding, idx) => (
            <FindingCard key={finding.id || idx} finding={finding} index={idx} />
          ))
        )}
      </div>
    </div>
  );
}
