"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Check,
  X,
  Zap,
  Crown,
  ArrowRight,
  Shield,
  FileSearch,
  Download,
  Gauge,
  Users,
  Headphones,
  Clock,
  Sparkles,
  Star,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";

interface UserPlan {
  plan: string;
  analyses_this_month: number;
}

const FREE_FEATURES = [
  { label: "10 analyses per day", included: true, icon: FileSearch },
  { label: "Detective + Judge agents", included: true, icon: Shield },
  { label: "Risk scoring & breakdown", included: true, icon: Gauge },
  { label: "Finding reports with tips", included: true, icon: Star },
  { label: "30-day data retention", included: true, icon: Clock },
  { label: "Priority AI processing", included: false, icon: Zap },
  { label: "Worst-case simulation", included: false, icon: Sparkles },
  { label: "Export reports (JSON)", included: false, icon: Download },
  { label: "Team collaboration", included: false, icon: Users },
  { label: "Priority support", included: false, icon: Headphones },
];

const PRO_FEATURES = [
  { label: "Unlimited daily analyses", included: true, icon: FileSearch },
  { label: "Full 3-agent pipeline", included: true, icon: Shield },
  { label: "Risk scoring & breakdown", included: true, icon: Gauge },
  { label: "Detailed finding reports", included: true, icon: Star },
  { label: "Unlimited data retention", included: true, icon: Clock },
  { label: "Priority AI processing", included: true, icon: Zap },
  { label: "Worst-case simulation", included: true, icon: Sparkles },
  { label: "Export reports (JSON)", included: true, icon: Download },
  { label: "Team collaboration", included: true, icon: Users },
  { label: "Priority support", included: true, icon: Headphones },
];

export default function PlansPage() {
  const { data: session } = useSession();
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlan() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          setUserPlan({ plan: data.plan, analyses_this_month: data.analyses_this_month });
        }
      } catch {}
    }
    if (session?.user) fetchPlan();
  }, [session]);

  async function handleUpgrade() {
    setError(null);
    setUpgrading(true);
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "Could not start checkout. Please try again.");
        setUpgrading(false);
        return;
      }
      // Redirect to Lemon Squeezy's hosted checkout page.
      window.location.href = data.url;
    } catch {
      setError("Could not start checkout. Please try again.");
      setUpgrading(false);
    }
  }

  const currentPlan = userPlan?.plan || "free";

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10 text-[#1a1a1a]">
      {/* ── Header ── */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight uppercase font-sans text-[#1a1a1a]">
          Plans & Pricing
        </h1>
        <p className="text-xs font-mono tracking-wider text-[#555555] uppercase">
          Choose the plan that fits your needs
        </p>
      </div>

      {/* ── Plan Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Free Tier */}
        <div className={`bg-[#ffffff] border-3 border-[#1a1a1a] flex flex-col ${currentPlan === "free" ? "neo-shadow-lg" : "neo-shadow"}`}>
          {/* Plan Header */}
          <div className="p-6 border-b-2 border-[#1a1a1a]">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 border-2 border-[#1a1a1a] bg-[#a7ffeb]">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xs font-black tracking-widest uppercase font-mono">Free</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-extrabold font-sans">$0</span>
              <span className="text-xs font-mono text-[#555555] uppercase">/month</span>
            </div>
            <p className="text-xs font-mono text-[#555555] mt-2 uppercase tracking-wider">
              Perfect for personal contract reviews
            </p>
          </div>

          {/* Features */}
          <div className="p-6 flex-1 space-y-3">
            {FREE_FEATURES.map((feature) => (
              <div key={feature.label} className="flex items-center gap-3">
                {feature.included ? (
                  <div className="w-5 h-5 border-2 border-[#1a1a1a] bg-[#a7ffeb] flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                ) : (
                  <div className="w-5 h-5 border-2 border-[#1a1a1a]/20 bg-[#f5f4f0] flex items-center justify-center flex-shrink-0">
                    <X className="w-3 h-3 text-[#555555]/50" />
                  </div>
                )}
                <span className={`text-xs font-bold uppercase tracking-wider ${feature.included ? "text-[#1a1a1a]" : "text-[#555555]/50"}`}>
                  {feature.label}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="p-6 border-t-2 border-[#1a1a1a]">
            {currentPlan === "free" ? (
              <div className="w-full py-3 bg-[#f5f4f0] border-2 border-[#1a1a1a] text-xs font-black tracking-wider uppercase text-center text-[#555555]">
                Current Plan
              </div>
            ) : (
              <button className="w-full py-3 bg-[#ffffff] border-2 border-[#1a1a1a] text-xs font-black tracking-wider uppercase neo-shadow-sm hover:translate-y-[-1px] active:translate-y-[1px] transition-all">
                Downgrade
              </button>
            )}
          </div>
        </div>

        {/* Pro Tier */}
        <div className="bg-[#ffffff] border-3 border-[#1a1a1a] neo-shadow-lg flex flex-col relative">
          {/* Recommended Badge */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#1a1a1a] border-2 border-[#1a1a1a] text-[#ffffff] text-[10px] font-black tracking-widest uppercase font-mono z-10">
            Recommended
          </div>

          {/* Plan Header */}
          <div className="p-6 border-b-2 border-[#1a1a1a] bg-[#ffe082]/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 border-2 border-[#1a1a1a] bg-[#ffe082]">
                <Crown className="w-5 h-5" />
              </div>
              <span className="text-xs font-black tracking-widest uppercase font-mono">Pro</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-extrabold font-sans">$5</span>
              <span className="text-xs font-mono text-[#555555] uppercase">/month</span>
            </div>
            <p className="text-xs font-mono text-[#555555] mt-2 uppercase tracking-wider">
              For professionals who can&apos;t afford to miss a clause
            </p>
          </div>

          {/* Features */}
          <div className="p-6 flex-1 space-y-3">
            {PRO_FEATURES.map((feature) => (
              <div key={feature.label} className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-[#1a1a1a] bg-[#ffe082] flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a]">
                  {feature.label}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="p-6 border-t-2 border-[#1a1a1a]">
            {currentPlan === "pro" ? (
              <div className="w-full py-3 bg-[#ffe082] border-2 border-[#1a1a1a] text-xs font-black tracking-wider uppercase text-center">
                Current Plan
              </div>
            ) : (
              <>
                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="w-full py-3 bg-[#ffe082] border-2 border-[#1a1a1a] text-xs font-black tracking-wider uppercase neo-shadow-sm hover:translate-y-[-1px] active:translate-y-[1px] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                >
                  <Zap className="w-4 h-4" />
                  {upgrading ? "Redirecting…" : "Upgrade to Pro"}
                  {!upgrading && <ArrowRight className="w-4 h-4" />}
                </button>
                {error && (
                  <p className="text-[10px] font-mono text-[#ff2d55] mt-2 uppercase tracking-wider text-center">
                    {error}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="bg-[#ffffff] border-3 border-[#1a1a1a] neo-shadow overflow-hidden">
        <div className="bg-[#1a1a1a] px-6 py-4">
          <h2 className="text-sm font-black tracking-wider uppercase text-[#ffffff] font-mono">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="divide-y-2 divide-[#1a1a1a]/10">
          <div className="p-6">
            <h3 className="text-sm font-extrabold uppercase tracking-tight">What counts as an analysis?</h3>
            <p className="text-xs font-mono text-[#555555] mt-1.5 leading-relaxed">
              Each contract you submit for scanning counts as one analysis. Re-viewing a previously scanned contract does not count against your limit.
            </p>
          </div>
          <div className="p-6">
            <h3 className="text-sm font-extrabold uppercase tracking-tight">Can I cancel anytime?</h3>
            <p className="text-xs font-mono text-[#555555] mt-1.5 leading-relaxed">
              Yes, you can downgrade back to the Free plan at any time. Your existing analyses will remain accessible.
            </p>
          </div>
          <div className="p-6">
            <h3 className="text-sm font-extrabold uppercase tracking-tight">What AI agents are included?</h3>
            <p className="text-xs font-mono text-[#555555] mt-1.5 leading-relaxed">
              Free tier includes the Detective (clause finder) and Judge (verifier) agents. Pro unlocks the Simulator agent for worst-case scenario projections.
            </p>
          </div>
        </div>
      </div>

      {/* ── Back Link ── */}
      <div className="text-center">
        <Link
          href={ROUTES.DASHBOARD}
          className="text-xs font-black font-mono tracking-widest uppercase text-[#555555] hover:text-[#1a1a1a] hover:underline"
        >
          &larr; Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
