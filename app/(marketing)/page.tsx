/**
 * Landing Page — Public marketing page for LexGuard.
 * Styled in high-fidelity Retro Neo-Brutalist design.
 */

"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Search,
  Scale,
  Zap,
  ArrowRight,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[#f5f4f0] text-[#111111] selection:bg-[#ffe082]">
      {/* ── Navigation ── */}
      <nav className="border-b-2 border-[#1a1a1a] bg-[#ffffff] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-black text-xl tracking-[0.12em] uppercase font-sans text-[#1a1a1a]">
              LexGuard
            </span>
          </div>

          <div>
            {session ? (
              <Link
                href={ROUTES.DASHBOARD}
                className="px-5 py-2.5 rounded-none text-xs font-black tracking-wider uppercase bg-[#a7ffeb] neo-btn flex items-center gap-1.5 text-[#1a1a1a]"
              >
                Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href={ROUTES.SIGN_IN}
                className="px-5 py-2.5 rounded-none text-xs font-black tracking-wider uppercase bg-[#d2c4fb] neo-btn flex items-center gap-1 text-[#1a1a1a]"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-8 font-sans text-[#1a1a1a]">
          DETECT PREDATORY
          <br />
          <span className="block mt-1">CLAUSES BEFORE YOU SIGN</span>
        </h1>

        {/* Subheading */}
        <p className="text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-mono text-[#444444]">
          LexGuard uses AI-powered agents to scan contracts,
          identify risks, and simulate outcomes – so you never
          sign away your rights.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
          {session ? (
            <>
              <Link
                href={ROUTES.DASHBOARD}
                className="flex items-center gap-2.5 px-8 py-4 bg-[#ff8a80] text-sm font-black tracking-wider uppercase rounded-none neo-btn text-[#1a1a1a]"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href={ROUTES.UPLOAD}
                className="flex items-center gap-2.5 px-8 py-4 bg-[#ffffff] text-sm font-black tracking-wider uppercase rounded-none neo-btn text-[#1a1a1a]"
              >
                Upload Contract
              </Link>
            </>
          ) : (
            <>
              <Link
                href={ROUTES.SIGN_IN}
                className="flex items-center gap-2.5 px-8 py-4 bg-[#ff8a80] text-sm font-black tracking-wider uppercase rounded-none neo-btn text-[#1a1a1a]"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href={`${ROUTES.SIGN_IN}?callbackUrl=/upload&demo=true`}
                className="flex items-center gap-2.5 px-8 py-4 bg-[#ffffff] text-sm font-black tracking-wider uppercase rounded-none neo-btn text-[#1a1a1a]"
              >
                Try Demo
              </Link>
            </>
          )}
        </div>
      </section>

      {/* ── Bento Grid Features ── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Detective */}
          <div className="bg-[#a7ffeb] border-2 border-[#1a1a1a] neo-shadow p-8 flex flex-col items-start text-left">
            <div className="w-12 h-12 bg-[#ffffff] border-2 border-[#1a1a1a] neo-shadow-sm flex items-center justify-center mb-6">
              <Search className="w-6 h-6 text-[#1a1a1a]" />
            </div>
            
            <div className="px-3 py-1 bg-[#1a1a1a] text-[#ffffff] font-mono text-[10px] font-black tracking-widest uppercase mb-4">
              Detective
            </div>

            <h3 className="text-xl font-extrabold mb-3 uppercase tracking-tight text-[#1a1a1a]">
              AI Client Examiner
            </h3>
            
            <p className="text-sm leading-relaxed text-[#222222] font-medium">
              An adversarial agent that inspects your contract&apos;s every word,
              identifying hidden risks, anomalies, and potential liabilities.
            </p>
          </div>

          {/* Card 2: Judge */}
          <div className="bg-[#ffe082] border-2 border-[#1a1a1a] neo-shadow p-8 flex flex-col items-start text-left">
            <div className="w-12 h-12 bg-[#ffffff] border-2 border-[#1a1a1a] neo-shadow-sm flex items-center justify-center mb-6">
              <Scale className="w-6 h-6 text-[#1a1a1a]" />
            </div>
            
            <div className="px-3 py-1 bg-[#1a1a1a] text-[#ffffff] font-mono text-[10px] font-black tracking-widest uppercase mb-4">
              Judge
            </div>

            <h3 className="text-xl font-extrabold mb-3 uppercase tracking-tight text-[#1a1a1a]">
              Validation Engine
            </h3>
            
            <p className="text-sm leading-relaxed text-[#222222] font-medium">
              Weighs each finding, filters out noise, compiles references,
              and delivers plain-English, actionable advice.
            </p>
          </div>

          {/* Card 3: Simulator */}
          <div className="bg-[#d2c4fb] border-2 border-[#1a1a1a] neo-shadow p-8 flex flex-col items-start text-left">
            <div className="w-12 h-12 bg-[#ffffff] border-2 border-[#1a1a1a] neo-shadow-sm flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-[#1a1a1a]" />
            </div>
            
            <div className="px-3 py-1 bg-[#1a1a1a] text-[#ffffff] font-mono text-[10px] font-black tracking-widest uppercase mb-4">
              Simulator
            </div>

            <h3 className="text-xl font-extrabold mb-3 uppercase tracking-tight text-[#1a1a1a]">
              Projection System
            </h3>
            
            <p className="text-sm leading-relaxed text-[#222222] font-medium">
              Simulates future operational, financial, and legal outcomes so you
              understand the long-term impact before you sign.
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 border-t-2 border-[#1a1a1a] bg-[#ffffff] text-center">
        <p className="text-xs font-mono tracking-wider text-[#555555] uppercase">
          © 2026 LexGuard · Built with Gemini + Vertex AI
        </p>
      </footer>
    </div>
  );
}
