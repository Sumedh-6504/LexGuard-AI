"use client";

import React, { useState } from "react";
import { Finding } from "../types/analysis";
import { AlertTriangle, ChevronDown, ChevronUp, CheckCircle, XCircle } from "lucide-react";

interface FindingCardProps {
  finding: Finding;
  index?: number;
}

const SEV: Record<string, { color: string; bg: string; label: string }> = {
  CRITICAL: { color: "#ff8a80", bg: "bg-[#ff8a80]",      label: "CRITICAL" },
  HIGH:     { color: "#ff8a80", bg: "bg-[#ff8a80]/80",   label: "HIGH"     },
  MEDIUM:   { color: "#ffe082", bg: "bg-[#ffe082]",      label: "MEDIUM"   },
  LOW:      { color: "#a7ffeb", bg: "bg-[#a7ffeb]",      label: "LOW"      },
};

const REC: Record<string, { bg: string; icon: React.ReactNode; label: string }> = {
  ACCEPT:    { bg: "bg-[#a7ffeb]", icon: <CheckCircle className="w-3.5 h-3.5" />,   label: "ACCEPT"    },
  // Under Retro Neo-Brutalist, NEGOTIATE matches lilac/yellow primary accent
  NEGOTIATE: { bg: "bg-[#d1c4e9]", icon: <AlertTriangle className="w-3.5 h-3.5" />, label: "NEGOTIATE" },
  REJECT:    { bg: "bg-[#ff8a80]", icon: <XCircle className="w-3.5 h-3.5" />,       label: "REJECT"    },
};

export default function FindingCard({ finding, index = 0 }: FindingCardProps) {
  const [isExpanded,  setIsExpanded]  = useState(false);
  const [tipExpanded, setTipExpanded] = useState(false);

  const sev = SEV[finding.severity] ?? SEV.LOW;
  const rec = REC[finding.recommendation];

  return (
    <div
      className="relative bg-[#ffffff] border-3 border-[#1a1a1a] neo-shadow overflow-hidden transition-all duration-100 hover:translate-y-[-1px] hover:shadow-[6px_6px_0px_0px_#1a1a1a] print-card"
      style={{
        animationDelay: `${index * 60}ms`,
      }}
    >
      {/* Severity color top bar strip */}
      <div className={`h-2 w-full border-b-2 border-[#1a1a1a] ${sev.bg}`} />

      <div className="p-6 space-y-4 text-[#1a1a1a]">

        {/* ── Header ── */}
        <div className="flex justify-between items-start gap-3">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center flex-wrap gap-2">
              {/* Severity badge */}
              <span className={`px-3 py-1 border-2 border-[#1a1a1a] text-[10px] font-black uppercase tracking-wider text-[#1a1a1a] rounded-none ${sev.bg}`}>
                {sev.label}
              </span>
              {/* Category */}
              <span className="px-3 py-1 border-2 border-[#1a1a1a] bg-[#f5f4f0] text-[10px] font-black font-mono tracking-wider uppercase text-[#1a1a1a] rounded-none">
                {finding.category.replace(/_/g, " ")}
              </span>
            </div>
            <h3 className="text-xl font-extrabold leading-snug uppercase tracking-tight text-[#1a1a1a]">
              {finding.title}
            </h3>
          </div>

          {/* Recommendation badge */}
          {rec && (
            <span className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 border-2 border-[#1a1a1a] text-[10px] font-black tracking-wider uppercase text-[#1a1a1a] rounded-none ${rec.bg} neo-shadow-sm`}>
              {rec.icon}
              {rec.label}
            </span>
          )}
        </div>

        {/* ── Clause text ── */}
        <div
          className="bg-[#ffe082] border-2 border-[#1a1a1a] p-4 cursor-pointer transition-all duration-100 hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#1a1a1a] active:translate-y-[1px]"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black tracking-widest uppercase font-mono text-[#1a1a1a]">
              Clause · {finding.clause_location}
            </span>
            {isExpanded
              ? <ChevronUp className="w-4 h-4 flex-shrink-0 text-[#1a1a1a]" />
              : <ChevronDown className="w-4 h-4 flex-shrink-0 text-[#1a1a1a]" />}
          </div>
          <p className={`text-sm leading-relaxed font-mono font-medium text-[#1a1a1a] ${isExpanded ? "" : "line-clamp-2"}`}>
            &ldquo;{finding.clause_text}&rdquo;
          </p>
        </div>

        {/* ── Detective | Judge ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#f5f4f0] border-2 border-[#1a1a1a] p-4">
            <p className="text-[10px] font-black tracking-widest uppercase mb-2 font-mono text-[#555555]">
              Detective Finding
            </p>
            <p className="text-sm italic leading-relaxed font-medium text-[#333333]">
              &ldquo;{finding.detective_finding}&rdquo;
            </p>
          </div>
          <div className="bg-[#f5f4f0] border-2 border-[#1a1a1a] p-4">
            <p className="text-[10px] font-black tracking-widest uppercase mb-2 font-mono text-[#555555]">
              Judge Verdict
            </p>
            <p className="text-sm leading-relaxed font-medium text-[#333333]">
              {finding.judge_verdict}
            </p>
          </div>
        </div>

        {/* ── Plain English Impact ── */}
        <div className={`border-2 border-[#1a1a1a] p-4 border-l-8 border-l-[#1a1a1a] ${sev.bg}`}>
          <p className="text-[10px] font-black tracking-widest uppercase mb-1.5 font-mono text-[#1a1a1a]">
            Plain English Impact
          </p>
          <p className="text-sm font-bold leading-relaxed text-[#1a1a1a]">
            {finding.plain_english_impact}
          </p>
        </div>

        {/* ── Negotiation Tip ── */}
        {(finding.recommendation === "NEGOTIATE" || finding.recommendation === "REJECT") && finding.negotiation_tip && (
          <div className="border-2 border-[#1a1a1a] overflow-hidden bg-[#ffffff]">
            <button
              className="w-full px-4 py-3 flex justify-between items-center bg-[#d1c4e9] hover:bg-[#d1c4e9]/80 transition-colors text-left border-b-2 border-[#1a1a1a]"
              onClick={() => setTipExpanded(!tipExpanded)}
            >
              <span className="flex items-center gap-2 text-xs font-black tracking-wider text-[#1a1a1a] uppercase">
                <AlertTriangle className="w-4 h-4 text-[#1a1a1a]" />
                Negotiation Tip
              </span>
              {tipExpanded
                ? <ChevronUp className="w-4 h-4 text-[#1a1a1a]" />
                : <ChevronDown className="w-4 h-4 text-[#1a1a1a]" />}
            </button>
            {tipExpanded && (
              <div className="px-4 py-3 text-sm leading-relaxed font-mono font-medium text-[#1a1a1a] bg-[#ffffff]">
                {finding.negotiation_tip}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
