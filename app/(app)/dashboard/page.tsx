/**
 * Dashboard Page — Analysis history styled in Retro Neo-Brutalist.
 * Dynamically lists all user contract scans and calculates live metrics.
 */

"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Upload,
  ShieldAlert,
  Search,
  Eye,
  Trash2,
  FileSearch,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";

interface AnalysisSummary {
  id: string;
  document_name: string;
  document_type: string | null;
  overall_risk_score: number;
  risk_level: string;
  summary_stats: Record<string, number>;
  created_at: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search filter state
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  /** Fetch analyses from database. */
  useEffect(() => {
    async function fetchAnalyses() {
      try {
        const res = await fetch("/api/analyses");
        if (res.ok) {
          const data = await res.json();
          setAnalyses(data.analyses ?? []);
        }
      } catch {
        console.error("Failed to fetch analyses");
      } finally {
        setIsLoading(false);
      }
    }
    if (session?.user) {
      fetchAnalyses();
    }
  }, [session]);

  /** Delete an analysis document. */
  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Delete this contract analysis? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/analyses/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAnalyses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {
      console.error("Failed to delete analysis");
    }
  }, []);

  /** Calculate live metrics from active documents. */
  const metrics = useMemo(() => {
    const total = analyses.length;
    
    // Average Risk Score calculation
    const avgScore = total
      ? Math.round(analyses.reduce((acc, curr) => acc + curr.overall_risk_score, 0) / total)
      : 0;

    // Sum up critical & high traps avoided
    const avoided = analyses.reduce((acc, a) => {
      const stats = a.summary_stats || {};
      const critical = stats.critical_count || stats.critical || 0;
      const high = stats.high_count || stats.high || 0;
      const medium = stats.medium_count || stats.medium || 0;
      return acc + critical + high + medium;
    }, 0);

    return { total, avgScore, avoided };
  }, [analyses]);

  /** Apply active search and filters. */
  const filteredAnalyses = useMemo(() => {
    let result = [...analyses];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((a) =>
        a.document_name.toLowerCase().includes(q)
      );
    }

    if (activeFilter) {
      result = result.filter((a) => a.risk_level === activeFilter);
    }

    // Newest first sorted default
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return result;
  }, [analyses, search, activeFilter]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 text-[#1a1a1a]">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight uppercase font-sans text-[#1a1a1a]">
          Dashboard
        </h1>
        <p className="text-xs font-mono tracking-wider text-[#555555] uppercase mt-1">
          Overview of your contract analysis activity
        </p>
      </div>

      {/* ── Dynamic Metric Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <div className="bg-[#d2c4fb] border-3 border-[#1a1a1a] neo-shadow p-6 flex flex-col justify-between min-h-[140px]">
          <span className="text-xs font-black tracking-wider uppercase font-sans">
            Contracts Scanned
          </span>
          <span className="text-5xl font-extrabold font-sans leading-none mt-4">
            {isLoading ? "..." : metrics.total}
          </span>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#ffe082] border-3 border-[#1a1a1a] neo-shadow p-6 flex flex-col justify-between min-h-[140px]">
          <span className="text-xs font-black tracking-wider uppercase font-sans">
            Average Risk Score
          </span>
          <span className="text-5xl font-extrabold font-sans leading-none mt-4">
            {isLoading ? "..." : `${metrics.avgScore}/100`}
          </span>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#a7ffeb] border-3 border-[#1a1a1a] neo-shadow p-6 flex flex-col justify-between min-h-[140px]">
          <span className="text-xs font-black tracking-wider uppercase font-sans">
            Risky Clauses Avoided
          </span>
          <span className="text-5xl font-extrabold font-sans leading-none mt-4">
            {isLoading ? "..." : metrics.avoided}
          </span>
        </div>
      </div>

      {/* ── Search Bar Filter ── */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents by name..."
            className="w-full neo-input rounded-none text-xs placeholder:text-[#555555]"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        {/* Quick Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          <span className="text-[10px] font-black font-mono uppercase tracking-wider mr-1 text-[#555555]">
            Filter:
          </span>
          <button
            onClick={() => setActiveFilter(null)}
            className={`px-3 py-1 text-[10px] font-black uppercase border-2 border-[#1a1a1a] transition-all ${
              activeFilter === null
                ? "bg-[#ffe082] neo-shadow-sm translate-y-[-1px]"
                : "bg-[#ffffff] hover:translate-y-[-1px] active:translate-y-[1px]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter("CRITICAL")}
            className={`px-3 py-1 text-[10px] font-black uppercase border-2 border-[#1a1a1a] transition-all ${
              activeFilter === "CRITICAL"
                ? "bg-[#ff8a80] neo-shadow-sm translate-y-[-1px]"
                : "bg-[#ffffff] hover:translate-y-[-1px] active:translate-y-[1px]"
            }`}
          >
            Critical
          </button>
          <button
            onClick={() => setActiveFilter("HIGH")}
            className={`px-3 py-1 text-[10px] font-black uppercase border-2 border-[#1a1a1a] transition-all ${
              activeFilter === "HIGH"
                ? "bg-[#ff8a80]/80 neo-shadow-sm translate-y-[-1px]"
                : "bg-[#ffffff] hover:translate-y-[-1px] active:translate-y-[1px]"
            }`}
          >
            High
          </button>
          <button
            onClick={() => setActiveFilter("MEDIUM")}
            className={`px-3 py-1 text-[10px] font-black uppercase border-2 border-[#1a1a1a] transition-all ${
              activeFilter === "MEDIUM"
                ? "bg-[#ffe082] neo-shadow-sm translate-y-[-1px]"
                : "bg-[#ffffff] hover:translate-y-[-1px] active:translate-y-[1px]"
            }`}
          >
            Medium
          </button>
          <button
            onClick={() => setActiveFilter("LOW")}
            className={`px-3 py-1 text-[10px] font-black uppercase border-2 border-[#1a1a1a] transition-all ${
              activeFilter === "LOW"
                ? "bg-[#a7ffeb] neo-shadow-sm translate-y-[-1px]"
                : "bg-[#ffffff] hover:translate-y-[-1px] active:translate-y-[1px]"
            }`}
          >
            Low
          </button>
        </div>
      </div>

      {/* ── Contracts Table Container ── */}
      <div id="contracts" className="bg-[#ffffff] border-3 border-[#1a1a1a] neo-shadow-lg overflow-hidden">
        {/* Block Header */}
        <div className="bg-[#1a1a1a] px-6 py-4 border-b-2 border-[#1a1a1a]">
          <h2 className="text-sm font-black tracking-wider uppercase text-[#ffffff] font-mono">
            Recent Contracts
          </h2>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-4 border-[#1a1a1a]/20 border-t-[#d2c4fb] rounded-full animate-spin" />
            <span className="text-xs font-mono font-black uppercase tracking-widest text-[#555555]">
              Loading Records...
            </span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && analyses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 px-6">
            <div className="p-4 border-2 border-[#1a1a1a] bg-[#ffe082] neo-shadow-sm">
              <ShieldAlert className="w-8 h-8 text-[#1a1a1a]" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-extrabold uppercase">No scans found</p>
              <p className="text-xs font-mono text-[#555555] uppercase max-w-sm">
                Analyze your first contract to uncover hidden traps and predatory terms
              </p>
            </div>
            <Link
              href={ROUTES.UPLOAD}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff8a80] text-xs font-black tracking-wider uppercase rounded-none neo-btn text-[#1a1a1a]"
            >
              <Upload className="w-4 h-4" />
              Upload Contract
            </Link>
          </div>
        )}

        {/* No Filter Results */}
        {!isLoading && analyses.length > 0 && filteredAnalyses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <FileSearch className="w-8 h-8 text-[#555555]" />
            <p className="text-xs font-mono font-black uppercase tracking-wider text-[#555555]">
              No documents match your filter query
            </p>
          </div>
        )}

        {/* Table Display */}
        {!isLoading && filteredAnalyses.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#1a1a1a] text-left">
                  <th className="px-6 py-4 text-xs font-black font-mono tracking-widest uppercase text-[#ffffff]">
                    Document Name
                  </th>
                  <th className="px-6 py-4 text-xs font-black font-mono tracking-widest uppercase text-[#ffffff]">
                    Upload Date
                  </th>
                  <th className="px-6 py-4 text-xs font-black font-mono tracking-widest uppercase text-[#ffffff]">
                    Risk Level
                  </th>
                  <th className="px-6 py-4 text-xs font-black font-mono tracking-widest uppercase text-[#ffffff] text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#1a1a1a]/10">
                {filteredAnalyses.map((analysis) => {
                  const dateString = new Date(analysis.created_at).toISOString().split("T")[0];

                  // Match Risk Color
                  let pillBg = "bg-[#a7ffeb]"; // Low Risk
                  if (analysis.risk_level === "CRITICAL") pillBg = "bg-[#ff8a80]";
                  if (analysis.risk_level === "HIGH") pillBg = "bg-[#ff8a80]/80";
                  if (analysis.risk_level === "MEDIUM") pillBg = "bg-[#ffe082]";

                  return (
                    <tr key={analysis.id} className="hover:bg-[#f5f4f0]/50 transition-colors">
                      <td className="px-6 py-4.5 text-xs font-extrabold uppercase truncate max-w-xs">
                        {analysis.document_name}
                      </td>
                      <td className="px-6 py-4.5 text-xs font-mono text-[#555555]">
                        {dateString}
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`inline-block px-3 py-1 border-2 border-[#1a1a1a] text-[10px] font-black uppercase tracking-wider ${pillBg}`}>
                          {analysis.risk_level} RISK
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <div className="inline-flex gap-3">
                          {/* View button */}
                          <Link
                            href={`/analysis/${analysis.id}`}
                            className="p-2 bg-[#ffffff] border-2 border-[#1a1a1a] neo-shadow-sm hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_0px_#1a1a1a] active:translate-y-[1px] active:shadow-[0px_0px_0px_0px_#1a1a1a] transition-all flex items-center justify-center text-[#1a1a1a]"
                            title="View Analysis"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete button */}
                          <button
                            onClick={() => handleDelete(analysis.id)}
                            className="p-2 bg-[#ffffff] border-2 border-[#1a1a1a] neo-shadow-sm hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_0px_#1a1a1a] hover:bg-[#ff8a80] active:translate-y-[1px] active:shadow-[0px_0px_0px_0px_#1a1a1a] transition-all flex items-center justify-center text-[#1a1a1a]"
                            title="Delete Scanned Document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
