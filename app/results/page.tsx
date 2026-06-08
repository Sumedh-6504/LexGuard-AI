/**
 * Guest/Demo Results Page — Redesigned with premium executive Stacked Risk Workbench.
 * Fully aligned with the LexGuard Retro Neo-Brutalist visual design system.
 */

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ContractAnalysis } from "@/types/analysis";
import RiskScoreBadge from "@/components/RiskScoreBadge";
import SummaryStats from "@/components/SummaryStats";
import FindingsList from "@/components/FindingsList";
import SimulatePanel from "@/components/SimulatePanel";
import { ArrowLeft, Download, Scroll, ChevronDown, ChevronUp } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export default function ResultsPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
  const [showContract, setShowContract] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem("lexguard_results");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        // Defer state update to next microtask to completely avoid synchronous setState in effect body error
        Promise.resolve().then(() => {
          setAnalysis(parsed);
        });
      } catch {
        router.push("/");
      }
    } else {
      router.push("/");
    }
  }, [router]);

  // Loading state
  if (!analysis) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#f5f4f0]">
        <div className="w-8 h-8 border-4 border-[#1a1a1a]/20 border-t-[#d2c4fb] rounded-full animate-spin" />
        <span className="text-xs font-mono font-black uppercase tracking-widest text-[#555555]">
          Loading analysis...
        </span>
      </div>
    );
  }

  // Highlight predatory clauses inside raw contract text
  const renderHighlightedContract = () => {
    const rawText = analysis.contract_text || "";
    if (!rawText.trim()) {
      return (
        <div className="text-center py-16 text-xs font-mono font-black uppercase tracking-wider text-[#555555]">
          [ No contract raw text available for highlighting ]
        </div>
      );
    }

    // Escape HTML first to prevent any script injections or rendering bugs
    let escapedHtml = rawText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Sort findings by length descending to prevent sub-string replacements breaking parent tags
    const sortedFindings = [...analysis.findings]
      .filter((f) => !f.false_positive && f.clause_text && f.clause_text.trim())
      .sort((a, b) => b.clause_text.length - a.clause_text.length);

    sortedFindings.forEach((finding) => {
      const clause = finding.clause_text.trim();
      const escapedClause = clause
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      if (escapedHtml.includes(escapedClause)) {
        const markerBg =
          finding.severity === "CRITICAL" || finding.severity === "HIGH"
            ? "bg-[#ff8a80]"
            : "bg-[#ffe082]";

        escapedHtml = escapedHtml.split(escapedClause).join(
          `<mark class="px-1 py-0.5 border border-[#1a1a1a] ${markerBg} text-[#1a1a1a] font-extrabold cursor-pointer rounded-none hover:opacity-80 transition-opacity" title="${finding.title} (${finding.severity})">${escapedClause}</mark>`
        );
      }
    });

    return (
      <div 
        className="whitespace-pre-wrap font-serif text-[15px] leading-relaxed text-[#1a1a1a] text-justify select-text selection:bg-[#ffe082]"
        dangerouslySetInnerHTML={{ __html: escapedHtml }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f4f0] text-[#1a1a1a] pb-24">
      
      {/* ── Action Bar / Top Nav ── */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push(ROUTES.HOME)}
            className="flex items-center gap-2 px-4 py-2 border-2 border-[#1a1a1a] bg-[#ffffff] text-xs font-black tracking-wider uppercase rounded-none neo-shadow-sm hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#1a1a1a] active:translate-y-[1px] transition-all text-[#1a1a1a]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>New Scan</span>
          </button>

          <button
            onClick={() => window.print()}
            className="no-print flex items-center gap-2 px-4 py-2 border-2 border-[#1a1a1a] bg-[#ffe082] text-xs font-black tracking-wider uppercase rounded-none neo-shadow-sm hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#1a1a1a] active:translate-y-[1px] transition-all text-[#1a1a1a]"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* ── Main Workspace — Full-Width Layout ── */}
      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-8">

        {/* ── Top Row: Score + Stats ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#ffffff] border-3 border-[#1a1a1a] p-6 neo-shadow-lg flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <RiskScoreBadge score={analysis.overall_risk_score} level={analysis.risk_level} />
            </div>
            <div className="flex-grow space-y-3 text-center sm:text-left">
              <p className="text-[10px] font-black tracking-widest uppercase font-mono text-[#555555]">
                Summary Analysis
              </p>
              <p className="text-sm font-bold leading-relaxed text-[#1a1a1a]">
                {analysis.contract_summary}
              </p>
              {analysis.analysis_metadata && (
                <p className="text-[9px] font-black tracking-widest uppercase font-mono text-[#777777]">
                  CONFIDENCE: {Math.round(analysis.analysis_metadata.judge_confidence * 100)}%
                </p>
              )}
            </div>
          </div>

          <div className="bg-[#ffffff] border-3 border-[#1a1a1a] p-6 neo-shadow-lg">
            <SummaryStats stats={analysis.summary_stats} />
          </div>
        </div>

        {/* ── Collapsible Contract Text Viewer ── */}
        {analysis.contract_text?.trim() && (
          <div className="bg-[#ffffff] border-3 border-[#1a1a1a] neo-shadow-lg overflow-hidden">
            <button
              onClick={() => setShowContract(!showContract)}
              className="w-full flex items-center justify-between px-6 py-4 bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Scroll className="w-4 h-4 text-[#ffffff]" />
                <span className="text-sm font-black tracking-wider uppercase text-[#ffffff] font-mono">
                  Agreement Text (Demo)
                </span>
                <span className="px-2 py-0.5 bg-[#a7ffeb] border border-[#1a1a1a] text-[8px] font-black font-mono tracking-widest uppercase text-[#1a1a1a]">
                  {analysis.document_type ? analysis.document_type.replace(/_/g, " ") : "CONTRACT"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-[#ffffff]/60 uppercase tracking-wider hidden sm:inline">
                  {showContract ? "Collapse" : "Expand to view highlighted clauses"}
                </span>
                {showContract ? (
                  <ChevronUp className="w-5 h-5 text-[#ffffff]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#ffffff]" />
                )}
              </div>
            </button>

            {showContract && (
              <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {renderHighlightedContract()}
              </div>
            )}
          </div>
        )}

        {/* ── Worst-Case Simulator ── */}
        {analysis.findings.length > 0 && (
          <div className="no-print">
            <SimulatePanel analysis={analysis} />
          </div>
        )}

        {/* ── Findings Feed — Full Width ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-0.5 bg-[#1a1a1a]" />
            <h3 className="text-xs font-black tracking-widest uppercase font-mono text-[#1a1a1a]">
              Findings Feed
            </h3>
            <div className="flex-1 h-0.5 bg-[#1a1a1a]" />
          </div>
          <FindingsList findings={analysis.findings} />
        </div>
      </div>

    </div>
  );
}
