"use client";

import React, { useState } from "react";
import { ContractAnalysis } from "../types/analysis";
import { Zap, Clock, DollarSign, TrendingDown, X } from "lucide-react";

interface SimulatePanelProps {
  analysis: ContractAnalysis;
}

interface ScenarioItem {
  finding_id: string;
  finding_title: string;
  scenario: string;
}

interface SimulationResult {
  worst_case_story: string;
  financial_risk: string;
  time_risk: string;
  probability: "LOW" | "MEDIUM" | "HIGH";
  scenarios: ScenarioItem[];
}

const PROB_STYLES = {
  HIGH: "bg-[#ff8a80]",
  MEDIUM: "bg-[#ffe082]",
  LOW: "bg-[#a7ffeb]",
};

export default function SimulatePanel({ analysis }: SimulatePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = async () => {
    setIsOpen(true);
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          findings: analysis.findings,
          contract_summary: analysis.contract_summary,
        }),
      });

      if (!res.ok) throw new Error("Simulation failed");
      setResult(await res.json());
    } catch {
      setError("Simulation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={runSimulation}
        className="no-print w-full flex items-center justify-center gap-2 py-4 bg-[#ff8a80] border-3 border-[#1a1a1a] text-[#1a1a1a] font-black text-lg uppercase tracking-wider rounded-none neo-shadow hover:translate-y-[-1px] hover:shadow-[6px_6px_0px_0px_#1a1a1a] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#1a1a1a] transition-all"
      >
        <Zap className="w-5 h-5" />
        <span>Simulate Worst-Case Scenario</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1a1a]/60 backdrop-blur-sm">
          <div className="bg-[#ffffff] border-3 border-[#1a1a1a] neo-shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-none">

            {/* Modal Header */}
            <div className="bg-[#ff8a80] border-b-3 border-[#1a1a1a] p-6 flex justify-between items-start text-[#1a1a1a]">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight font-sans">Worst-Case Scenario</h2>
                <p className="text-xs font-mono font-black uppercase tracking-wider text-[#1a1a1a]/70 mt-1">
                  What happens if you sign without negotiating
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 border-2 border-[#1a1a1a] bg-[#ffffff] hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_0px_#1a1a1a] active:translate-y-[1px] text-[#1a1a1a] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-[#1a1a1a]">
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-8 h-8 border-4 border-[#1a1a1a]/20 border-t-[#d2c4fb] rounded-full animate-spin" />
                  <p className="text-xs font-mono font-black uppercase tracking-wider text-[#555555]">Generating scenarios...</p>
                </div>
              )}

              {error && (
                <div className="bg-[#ff8a80] border-2 border-[#1a1a1a] p-4 text-xs font-black uppercase tracking-wider">
                  {error}
                </div>
              )}

              {result && (
                <>
                  {/* Narrative */}
                  <div className="bg-[#ffe082] border-2 border-[#1a1a1a] p-5 neo-shadow-sm">
                    <p className="text-[10px] font-black text-[#1a1a1a] uppercase tracking-widest font-mono mb-2">
                      The Story
                    </p>
                    <p className="leading-relaxed font-bold text-sm">
                      {result.worst_case_story}
                    </p>
                  </div>

                  {/* Risk Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-[#ffffff] border-2 border-[#1a1a1a] p-4 text-center neo-shadow-sm">
                      <DollarSign className="w-5 h-5 text-[#1a1a1a] mx-auto mb-2" />
                      <p className="text-[9px] font-black text-[#555555] uppercase tracking-wider mb-1 font-mono">
                        Financial Risk
                      </p>
                      <p className="text-xs font-black uppercase">{result.financial_risk}</p>
                    </div>
                    <div className="bg-[#ffffff] border-2 border-[#1a1a1a] p-4 text-center neo-shadow-sm">
                      <Clock className="w-5 h-5 text-[#1a1a1a] mx-auto mb-2" />
                      <p className="text-[9px] font-black text-[#555555] uppercase tracking-wider mb-1 font-mono">
                        Time Risk
                      </p>
                      <p className="text-xs font-black uppercase">{result.time_risk}</p>
                    </div>
                    <div className={`border-2 border-[#1a1a1a] p-4 text-center neo-shadow-sm ${PROB_STYLES[result.probability] ?? PROB_STYLES.MEDIUM}`}>
                      <TrendingDown className="w-5 h-5 text-[#1a1a1a] mx-auto mb-2" />
                      <p className="text-[9px] font-black text-[#1a1a1a]/70 uppercase tracking-wider mb-1 font-mono">
                        Likelihood
                      </p>
                      <p className="text-xs font-black uppercase">{result.probability}</p>
                    </div>
                  </div>

                  {/* Per-clause scenarios */}
                  {result.scenarios?.length > 0 && (
                    <div className="space-y-4">
                      <p className="text-xs font-black text-[#555555] uppercase tracking-widest font-mono">
                        Per-Clause Scenarios
                      </p>
                      <div className="space-y-3">
                        {result.scenarios.map((s, i) => (
                          <div
                            key={i}
                            className="bg-[#a7ffeb] border-2 border-[#1a1a1a] p-4"
                          >
                            <p className="text-[10px] font-black text-[#1a1a1a]/70 uppercase tracking-wider mb-1 font-mono">
                              {s.finding_title}
                            </p>
                            <p className="text-sm font-medium leading-relaxed">{s.scenario}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full py-3 bg-[#ffffff] border-2 border-[#1a1a1a] text-xs font-black tracking-wider uppercase rounded-none neo-shadow-sm hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#1a1a1a] active:translate-y-[1px] transition-all flex items-center justify-center"
                  >
                    Close Simulation
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
