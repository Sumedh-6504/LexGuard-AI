import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServerClient();
    const userId = session.user.id;

    const [userRes, docsRes, analysesRes] = await Promise.all([
      supabase
        .from("users")
        .select("id, email, name, auth_provider, plan, analyses_this_month, created_at")
        .eq("id", userId)
        .single(),
      supabase
        .from("documents")
        .select("id, file_name, file_type, detected_type, char_count, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("analyses")
        .select("id, document_id, risk_score, risk_level, contract_summary, total_findings, critical_count, high_count, medium_count, low_count, analyzed_at")
        .eq("user_id", userId)
        .order("analyzed_at", { ascending: false }),
    ]);

    const analysisIds = (analysesRes.data ?? []).map((a) => a.id);
    let findings: Record<string, unknown>[] = [];
    let simulations: Record<string, unknown>[] = [];

    if (analysisIds.length > 0) {
      const [findingsRes, simulationsRes] = await Promise.all([
        supabase
          .from("findings")
          .select("id, analysis_id, title, category, severity, clause_text, clause_location, detective_finding, judge_verdict, plain_english_impact, recommendation, negotiation_tip, verified, false_positive")
          .in("analysis_id", analysisIds),
        supabase
          .from("simulations")
          .select("id, analysis_id, worst_case_story, financial_risk, time_risk, probability, scenarios, created_at")
          .in("analysis_id", analysisIds),
      ]);
      findings = findingsRes.data ?? [];
      simulations = simulationsRes.data ?? [];
    }

    const exportData = {
      exported_at: new Date().toISOString(),
      user: userRes.data,
      documents: docsRes.data ?? [],
      analyses: (analysesRes.data ?? []).map((analysis) => ({
        ...analysis,
        findings: findings.filter((f) => f.analysis_id === analysis.id),
        simulations: simulations.filter((s) => s.analysis_id === analysis.id),
      })),
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="lexguard-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
