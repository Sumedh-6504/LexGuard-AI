export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type RiskLevel = "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Recommendation = "ACCEPT" | "NEGOTIATE" | "REJECT";
export type DocumentType =
  | "CONTRACT"
  | "OFFER_LETTER"
  | "QUOTATION"
  | "TICKET_TERMS"
  | "PRIVACY_POLICY"
  | "TERMS_OF_SERVICE"
  | "OTHER";

export type Category =
  | "AUTO_RENEWAL_TRAP"
  | "DATA_EXPLOITATION"
  | "UNILATERAL_CHANGE"
  | "ARBITRATION_WAIVER"
  | "INDEMNIFICATION_OVERREACH"
  | "LIABILITY_CAP_ABUSE"
  | "IP_GRAB"
  | "TERMINATION_PENALTY"
  | "CONFIDENTIALITY_OVERREACH"
  | "HIDDEN_FEE"
  | "GOVERNING_LAW_TRAP"
  | "AMBIGUITY_RISK"
  | "OTHER_RISK";

export interface Finding {
  id: string;
  clause_text: string;
  clause_location: string;
  category: Category;
  severity: Severity;
  title: string;
  detective_finding: string;
  judge_verdict: string;
  plain_english_impact: string;
  recommendation: Recommendation;
  negotiation_tip: string;
  verified: boolean;
  false_positive: boolean;
}

export interface SummaryStats {
  total_findings: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  false_positives_removed: number;
}

export interface AnalysisMetadata {
  judge_confidence: number;
  analysis_timestamp: string;
}

export interface ContractAnalysis {
  document_type: DocumentType;
  contract_text?: string;
  contract_summary: string;
  overall_risk_score: number;
  risk_level: RiskLevel;
  summary_stats: SummaryStats;
  analysis_metadata: AnalysisMetadata;
  findings: Finding[];
}
