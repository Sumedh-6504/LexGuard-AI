/**
 * Supabase Database Types — Normalised Schema (v2)
 *
 * 7 tables: users, organizations, documents, analyses, findings, simulations, policies
 *
 * These types mirror the Supabase schema and provide end-to-end type safety.
 * Inline object types are used (not interfaces) because Supabase's generic
 * inference requires this exact shape to resolve correctly.
 */

/* ────────────────────────────────────────────────────────────────────
 * Convenience Row types — for use in application code
 * ──────────────────────────────────────────────────────────────────── */

export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  auth_provider: string;
  plan: string;
  org_id: string | null;
  analyses_this_month: number;
  ls_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentRow {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string | null;
  detected_type: string | null;
  contract_text: string | null;
  char_count: number;
  storage_path: string | null;
  created_at: string;
}

export interface AnalysisRow {
  id: string;
  document_id: string;
  user_id: string;
  risk_score: number;
  risk_level: string;
  judge_confidence: number | null;
  contract_summary: string | null;
  total_findings: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  false_positives_removed: number;
  analyzed_at: string;
}

export interface FindingRow {
  id: string;
  analysis_id: string;
  finding_ref: string;
  title: string;
  category: string;
  severity: string;
  clause_text: string | null;
  clause_location: string | null;
  detective_finding: string | null;
  judge_verdict: string | null;
  plain_english_impact: string | null;
  recommendation: string;
  negotiation_tip: string | null;
  verified: boolean;
  false_positive: boolean;
  sort_order: number;
}

export interface SimulationRow {
  id: string;
  analysis_id: string;
  worst_case_story: string | null;
  financial_risk: string | null;
  time_risk: string | null;
  probability: string;
  scenarios: Record<string, unknown>[];
  created_at: string;
}

/* ────────────────────────────────────────────────────────────────────
 * Database type — Supabase client generic parameter
 * ──────────────────────────────────────────────────────────────────── */

export type Database = {
  public: {
    Tables: {

      /* ── users ──────────────────────────────────────────────────── */
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          auth_provider: string;
          plan: string;
          org_id: string | null;
          analyses_this_month: number;
          password_hash: string | null;
          ls_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          auth_provider?: string;
          plan?: string;
          org_id?: string | null;
          analyses_this_month?: number;
          password_hash?: string | null;
          ls_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          auth_provider?: string;
          plan?: string;
          org_id?: string | null;
          analyses_this_month?: number;
          password_hash?: string | null;
          ls_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      /* ── organizations ──────────────────────────────────────────── */
      organizations: {
        Row: {
          id: string;
          name: string;
          domain: string | null;
          plan: string;
          settings: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          domain?: string | null;
          plan?: string;
          settings?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          domain?: string | null;
          plan?: string;
          settings?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      /* ── documents ──────────────────────────────────────────────── */
      documents: {
        Row: {
          id: string;
          user_id: string;
          file_name: string;
          file_type: string | null;
          detected_type: string | null;
          contract_text: string | null;
          char_count: number;
          storage_path: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_name?: string;
          file_type?: string | null;
          detected_type?: string | null;
          contract_text?: string | null;
          char_count?: number;
          storage_path?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          file_name?: string;
          file_type?: string | null;
          detected_type?: string | null;
          contract_text?: string | null;
          char_count?: number;
          storage_path?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      /* ── analyses ───────────────────────────────────────────────── */
      analyses: {
        Row: {
          id: string;
          document_id: string;
          user_id: string;
          risk_score: number;
          risk_level: string;
          judge_confidence: number | null;
          contract_summary: string | null;
          total_findings: number;
          critical_count: number;
          high_count: number;
          medium_count: number;
          low_count: number;
          false_positives_removed: number;
          analyzed_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          user_id: string;
          risk_score?: number;
          risk_level?: string;
          judge_confidence?: number | null;
          contract_summary?: string | null;
          total_findings?: number;
          critical_count?: number;
          high_count?: number;
          medium_count?: number;
          low_count?: number;
          false_positives_removed?: number;
          analyzed_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          user_id?: string;
          risk_score?: number;
          risk_level?: string;
          judge_confidence?: number | null;
          contract_summary?: string | null;
          total_findings?: number;
          critical_count?: number;
          high_count?: number;
          medium_count?: number;
          low_count?: number;
          false_positives_removed?: number;
          analyzed_at?: string;
        };
        Relationships: [];
      };

      /* ── findings ───────────────────────────────────────────────── */
      findings: {
        Row: {
          id: string;
          analysis_id: string;
          finding_ref: string;
          title: string;
          category: string;
          severity: string;
          clause_text: string | null;
          clause_location: string | null;
          detective_finding: string | null;
          judge_verdict: string | null;
          plain_english_impact: string | null;
          recommendation: string;
          negotiation_tip: string | null;
          verified: boolean;
          false_positive: boolean;
          sort_order: number;
        };
        Insert: {
          id?: string;
          analysis_id: string;
          finding_ref: string;
          title: string;
          category: string;
          severity: string;
          clause_text?: string | null;
          clause_location?: string | null;
          detective_finding?: string | null;
          judge_verdict?: string | null;
          plain_english_impact?: string | null;
          recommendation?: string;
          negotiation_tip?: string | null;
          verified?: boolean;
          false_positive?: boolean;
          sort_order?: number;
        };
        Update: {
          id?: string;
          analysis_id?: string;
          finding_ref?: string;
          title?: string;
          category?: string;
          severity?: string;
          clause_text?: string | null;
          clause_location?: string | null;
          detective_finding?: string | null;
          judge_verdict?: string | null;
          plain_english_impact?: string | null;
          recommendation?: string;
          negotiation_tip?: string | null;
          verified?: boolean;
          false_positive?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };

      /* ── simulations ────────────────────────────────────────────── */
      simulations: {
        Row: {
          id: string;
          analysis_id: string;
          worst_case_story: string | null;
          financial_risk: string | null;
          time_risk: string | null;
          probability: string;
          scenarios: Record<string, unknown>[];
          created_at: string;
        };
        Insert: {
          id?: string;
          analysis_id: string;
          worst_case_story?: string | null;
          financial_risk?: string | null;
          time_risk?: string | null;
          probability?: string;
          scenarios?: Record<string, unknown>[];
          created_at?: string;
        };
        Update: {
          id?: string;
          analysis_id?: string;
          worst_case_story?: string | null;
          financial_risk?: string | null;
          time_risk?: string | null;
          probability?: string;
          scenarios?: Record<string, unknown>[];
          created_at?: string;
        };
        Relationships: [];
      };

      /* ── policies ───────────────────────────────────────────────── */
      policies: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          allowed_doc_types: string[];
          max_risk_threshold: number;
          auto_reject_critical: boolean;
          require_simulation: boolean;
          monthly_analysis_limit: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          allowed_doc_types?: string[];
          max_risk_threshold?: number;
          auto_reject_critical?: boolean;
          require_simulation?: boolean;
          monthly_analysis_limit?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          allowed_doc_types?: string[];
          max_risk_threshold?: number;
          auto_reject_critical?: boolean;
          require_simulation?: boolean;
          monthly_analysis_limit?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
