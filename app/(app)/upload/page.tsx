/**
 * Upload Page — Contract analysis entry point (authenticated).
 * Styled in beautiful Retro Neo-Brutalist design.
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ContractUpload from "@/components/ContractUpload";
import { AlertTriangle, FileText, ArrowRight } from "lucide-react";

// Premium Predatory Templates for instant testing
const PREDATORY_TEMPLATES = [
  {
    title: "SaaS Service Agreement",
    desc: "Contains unilateral auto-renewal locks, hidden pricing fees, and extreme indemnity liability shifts.",
    text: `SOFTWARE SERVICE AGREEMENT

This software service agreement ("Agreement") is entered into by and between CloudSaaS Corp ("Provider") and the Subscriber.

1. TERM AND AUTOMATIC RENEWAL: This agreement shall commence on the Effective Date and remain in effect for a period of one (1) year. EXCEPT AS OTHERWISE SPECIFIED HEREIN, THIS AGREEMENT SHALL AUTOMATICALLY RENEW FOR SUCCESSIVE THREE (3) YEAR TERMS unless either party provides written notice of non-renewal at least 180 days prior to the expiration of the then-current term.

2. PRICE ADJUSTMENTS: Provider reserves the right, in its sole and absolute discretion, to increase subscription pricing by up to forty percent (40%) at the commencement of any renewal term without prior notification to the Subscriber.

3. INDEMNIFICATION: Subscriber agrees to indemnify, defend, and hold harmless Provider and its affiliates from and against any and all claims, losses, damages, liabilities, and expenses (including reasonable attorneys' fees) arising out of or in connection with the software platform, even in cases where Provider's direct negligence caused the damages.`
  },
  {
    title: "Employment Agreement",
    desc: "Features highly predatory non-compete clauses (unlimited geography) and unilateral IP ownership assignments.",
    text: `EXECUTIVE EMPLOYMENT AGREEMENT

This Employment Agreement is entered into by TechStart Inc ("Company") and the undersigned Employee.

1. NON-COMPETE CLAUSE: During the Term of Employment and for a period of five (5) years following the termination of employment for any reason, Employee shall not directly or indirectly engage in, own, manage, or advise any business that competes with the Company anywhere in the absolute world.

2. IP INTELLECTUAL PROPERTY ASSIGNMENT: Employee hereby covenants, agrees, and irrevocably assigns to the Company all rights, title, and interests in and to all ideas, inventions, patents, processes, and products developed, conceived, or designed by the Employee during the term of employment, regardless of whether developed during business hours or using Company equipment.`
  },
  {
    title: "Mutual NDA (Non-Disclosure)",
    desc: "Asymmetrical definition of confidential details and perpetual survival times.",
    text: `MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement is made by and between Partner A and Partner B.

1. CONFIDENTIAL INFORMATION: Confidential Information shall mean all proprietary information disclosed by Discloser to Recipient. However, Recipient's obligations of non-disclosure shall apply to Partner A's disclosures forever. In contrast, Partner B's disclosures shall only be protected for a period of six (6) months.

2. LIQUIDATED DAMAGES: In the event of any breach of this Agreement by the Recipient, Recipient shall pay to Discloser, as liquidated damages and not as a penalty, the sum of Five Hundred Thousand Dollars ($500,000) per breach, without the need for Discloser to prove actual damages.`
  }
];

export default function UploadPage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");

  const handleAnalyze = async (textToScan: string) => {
    if (!textToScan.trim()) {
      setError("Please paste a contract or load a template before initiating scan.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep("Detective scanning...");
    setError(null);

    try {
      const stepTimer = setTimeout(() => setAnalysisStep("Judge verifying..."), 4500);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractText: textToScan }),
      });

      clearTimeout(stepTimer);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const detail = body?.detail ?? body?.error ?? `Server error (${res.status})`;
        if (res.status === 429) {
          setError(`Rate limit block: ${detail}`);
        } else {
          setError(detail);
        }
        setIsAnalyzing(false);
        setAnalysisStep(null);
        return;
      }

      const data = await res.json();

      if (data.id) {
        router.push(`/analysis/${data.id}`);
      } else {
        const resultData = { ...data, contract_text: textToScan };
        sessionStorage.setItem("lexguard_results", JSON.stringify(resultData));
        router.push("/results");
      }
    } catch {
      setError("Could not reach the analysis server. Make sure the backend is running.");
      setIsAnalyzing(false);
      setAnalysisStep(null);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10 text-[#1a1a1a]">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight uppercase font-sans text-[#1a1a1a]">
          Upload Contract
        </h1>
        <p className="text-xs font-mono tracking-wider text-[#555555] uppercase mt-1">
          Upload your contract for AI-powered risk analysis
        </p>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="flex items-start gap-2.5 p-3.5 bg-[#ff8a80] border-2 border-[#1a1a1a] text-xs font-bold text-[#1a1a1a] neo-shadow-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Core Upload & Dropzone Component ── */}
      <div className="bg-[#ffffff] border-3 border-[#1a1a1a] p-8 neo-shadow-lg">
        <ContractUpload
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          analysisStep={analysisStep}
          text={text}
          onTextChange={setText}
        />
      </div>

      {/* ── Quick Start Predatory Templates ── */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight uppercase font-sans text-[#1a1a1a]">
            Quick-Start Predatory Templates
          </h2>
          <p className="text-xs font-mono tracking-wider text-[#555555] uppercase mt-1">
            Test the system with pre-loaded risky contracts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PREDATORY_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.title}
              className="bg-[#ffffff] border-2 border-[#1a1a1a] p-6 neo-shadow flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 bg-[#ffffff] border-2 border-[#1a1a1a] neo-shadow-sm flex items-center justify-center mb-4">
                  <FileText className="w-5 h-5 text-[#1a1a1a]" />
                </div>
                <h3 className="text-base font-extrabold uppercase tracking-tight mb-2">
                  {tmpl.title}
                </h3>
                <p className="text-[11px] leading-relaxed text-[#555555] font-medium mb-6">
                  {tmpl.desc}
                </p>
              </div>

              <button
                onClick={() => {
                  setText(tmpl.text);
                }}
                className="w-full py-2 bg-[#ffe082] border-2 border-[#1a1a1a] text-[10px] font-black uppercase tracking-wider neo-shadow-sm hover:translate-y-[-1px] active:translate-y-[1px] transition-all flex items-center justify-center gap-1.5 text-[#1a1a1a]"
              >
                <span>Load Template</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
