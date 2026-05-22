/**
 * GET /api/analyses/[id] — Fetch a single analysis with all findings.
 * DELETE /api/analyses/[id] — Delete an analysis (cascades to findings + simulation).
 *
 * GET joins: analyses + documents + findings to build the full
 * ContractAnalysis object the frontend expects.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** GET — Fetch a single analysis with all related data. */
export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const supabase = createServerClient();

    // Fetch analysis
    const { data: analysis, error: analysisErr } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single();

    if (analysisErr || !analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    // Fetch the parent document
    const { data: doc } = await supabase
      .from("documents")
      .select("file_name, detected_type, contract_text")
      .eq("id", analysis.document_id)
      .single();

    // Fetch findings for this analysis
    const { data: findings } = await supabase
      .from("findings")
      .select("*")
      .eq("analysis_id", id)
      .order("sort_order", { ascending: true });

    // Map to the ContractAnalysis shape the frontend expects
    return NextResponse.json({
      id: analysis.id,
      document_type: doc?.detected_type ?? "CONTRACT",
      contract_text: doc?.contract_text ?? "",
      contract_summary: analysis.contract_summary ?? "",
      overall_risk_score: analysis.risk_score,
      risk_level: analysis.risk_level,
      summary_stats: {
        total_findings: analysis.total_findings,
        critical_count: analysis.critical_count,
        high_count: analysis.high_count,
        medium_count: analysis.medium_count,
        low_count: analysis.low_count,
        false_positives_removed: analysis.false_positives_removed,
      },
      analysis_metadata: {
        judge_confidence: analysis.judge_confidence ?? 0,
        analysis_timestamp: analysis.analyzed_at,
      },
      findings: (findings ?? []).map((f) => ({
        id: f.finding_ref,
        clause_text: f.clause_text ?? "",
        clause_location: f.clause_location ?? "",
        category: f.category,
        severity: f.severity,
        title: f.title,
        detective_finding: f.detective_finding ?? "",
        judge_verdict: f.judge_verdict ?? "",
        plain_english_impact: f.plain_english_impact ?? "",
        recommendation: f.recommendation,
        negotiation_tip: f.negotiation_tip ?? "",
        verified: f.verified,
        false_positive: f.false_positive,
      })),
    });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** DELETE — Remove an analysis. FK cascades handle findings + simulations. */
export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const supabase = createServerClient();

    // First, get the document_id so we can delete the document too
    const { data: analysis } = await supabase
      .from("analyses")
      .select("document_id")
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single();

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    // Delete the document — CASCADE will remove the analysis,
    // which will CASCADE remove findings + simulations
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", analysis.document_id);

    if (error) {
      console.error("Delete error:", error);
      return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
