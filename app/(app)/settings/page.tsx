"use client";

import React, { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import {
  Sun,
  Moon,
  Download,
  Trash2,
  AlertTriangle,
  Check,
  Info,
  Palette,
  Database,
  Shield,
} from "lucide-react";

export default function SettingsPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lexguard-theme");
    if (saved === "dark") {
      Promise.resolve().then(() => setTheme("dark"));
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("lexguard-theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    try {
      const res = await fetch("/api/user/export");
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lexguard-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch {
      console.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteText !== "DELETE") return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/user/profile", { method: "DELETE" });
      if (res.ok) {
        signOut({ callbackUrl: "/" });
      }
    } catch {
      console.error("Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8 text-[#1a1a1a]">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight uppercase font-sans text-[#1a1a1a]">
          Settings
        </h1>
        <p className="text-xs font-mono tracking-wider text-[#555555] uppercase mt-1">
          Application preferences
        </p>
      </div>

      {/* ── Appearance Card ── */}
      <div className="bg-[#ffffff] border-3 border-[#1a1a1a] neo-shadow-lg overflow-hidden">
        <div className="bg-[#1a1a1a] px-6 py-4 flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#ffffff]" />
          <h2 className="text-sm font-black tracking-wider uppercase text-[#ffffff] font-mono">
            Appearance
          </h2>
        </div>

        <div className="p-6">
          <p className="text-xs font-mono text-[#555555] uppercase tracking-wider mb-4">
            Select your preferred theme
          </p>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => toggleTheme("light")}
              className={`flex flex-col items-center gap-3 p-5 border-2 border-[#1a1a1a] transition-all duration-100 ${
                theme === "light"
                  ? "bg-[#ffe082] neo-shadow-sm translate-y-[-1px]"
                  : "bg-[#ffffff] hover:translate-y-[-1px] hover:bg-[#f5f4f0]"
              }`}
            >
              <Sun className="w-6 h-6" />
              <span className="text-xs font-black uppercase tracking-wider">Light</span>
            </button>
            <button
              onClick={() => toggleTheme("dark")}
              className={`flex flex-col items-center gap-3 p-5 border-2 border-[#1a1a1a] transition-all duration-100 ${
                theme === "dark"
                  ? "bg-[#d2c4fb] neo-shadow-sm translate-y-[-1px]"
                  : "bg-[#ffffff] hover:translate-y-[-1px] hover:bg-[#f5f4f0]"
              }`}
            >
              <Moon className="w-6 h-6" />
              <span className="text-xs font-black uppercase tracking-wider">Dark</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Data & Privacy Card ── */}
      <div className="bg-[#ffffff] border-3 border-[#1a1a1a] neo-shadow-lg overflow-hidden">
        <div className="bg-[#1a1a1a] px-6 py-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-[#ffffff]" />
          <h2 className="text-sm font-black tracking-wider uppercase text-[#ffffff] font-mono">
            Data & Privacy
          </h2>
        </div>

        <div className="divide-y-2 divide-[#1a1a1a]/10">
          {/* Export Section */}
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-tight">Export Your Data</h3>
              <p className="text-xs font-mono text-[#555555] uppercase tracking-wider mt-1">
                Download all your analyses, findings, and simulations as JSON
              </p>
            </div>

            {exportSuccess && (
              <div className="flex items-center gap-2.5 p-3.5 bg-[#a7ffeb] border-2 border-[#1a1a1a] text-xs font-black uppercase tracking-wider text-[#1a1a1a]">
                <Check className="w-4 h-4" />
                Export downloaded successfully
              </div>
            )}

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-6 py-3 bg-[#d2c4fb] text-xs font-black tracking-wider uppercase rounded-none neo-btn flex items-center gap-2 text-[#1a1a1a] disabled:opacity-40 disabled:pointer-events-none"
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-[#1a1a1a]/30 border-t-[#1a1a1a] rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export All Data
            </button>
          </div>

          {/* Delete Account Section */}
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-tight text-[#ff8a80]">
                Danger Zone
              </h3>
              <p className="text-xs font-mono text-[#555555] uppercase tracking-wider mt-1">
                Permanently delete your account and all associated data
              </p>
            </div>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-3 bg-[#ffffff] text-xs font-black tracking-wider uppercase rounded-none border-2 border-[#ff8a80] flex items-center gap-2 text-[#ff8a80] hover:bg-[#ff8a80] hover:text-[#1a1a1a] transition-all neo-shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            ) : (
              <div className="bg-[#ff8a80]/10 border-2 border-[#ff8a80] p-5 space-y-4">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-[#ff8a80] flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-wider text-[#1a1a1a]">
                      This action cannot be undone
                    </p>
                    <p className="text-[11px] font-mono text-[#555555]">
                      All your analyses, documents, findings, and simulations will be permanently deleted.
                      Type <strong>DELETE</strong> to confirm.
                    </p>
                  </div>
                </div>

                <input
                  type="text"
                  value={deleteText}
                  onChange={(e) => setDeleteText(e.target.value)}
                  placeholder='Type "DELETE" to confirm'
                  className="w-full neo-input rounded-none text-sm"
                />

                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteText !== "DELETE" || isDeleting}
                    className="px-6 py-3 bg-[#ff8a80] text-xs font-black tracking-wider uppercase rounded-none border-2 border-[#1a1a1a] flex items-center gap-2 text-[#1a1a1a] disabled:opacity-40 disabled:pointer-events-none neo-shadow-sm"
                  >
                    {isDeleting ? (
                      <div className="w-4 h-4 border-2 border-[#1a1a1a]/30 border-t-[#1a1a1a] rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Permanently Delete
                  </button>
                  <button
                    onClick={() => { setShowDeleteConfirm(false); setDeleteText(""); }}
                    className="px-6 py-3 bg-[#ffffff] text-xs font-black tracking-wider uppercase rounded-none border-2 border-[#1a1a1a] neo-shadow-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── About Card ── */}
      <div className="bg-[#ffffff] border-3 border-[#1a1a1a] neo-shadow-lg overflow-hidden">
        <div className="bg-[#1a1a1a] px-6 py-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-[#ffffff]" />
          <h2 className="text-sm font-black tracking-wider uppercase text-[#ffffff] font-mono">
            About
          </h2>
        </div>

        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider">Version</span>
            <span className="px-3 py-1 border-2 border-[#1a1a1a] bg-[#f5f4f0] text-[10px] font-black font-mono uppercase tracking-wider">
              v1.0.0
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider">AI Engine</span>
            <span className="text-xs font-mono text-[#555555]">Gemini 2.5 Flash</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider">Architecture</span>
            <span className="text-xs font-mono text-[#555555]">3-Agent Adversarial Pipeline</span>
          </div>
          <div className="border-t-2 border-[#1a1a1a]/10 pt-3 mt-3">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#555555]" />
              <p className="text-[10px] font-mono text-[#555555] uppercase tracking-wider">
                &copy; 2026 LexGuard &middot; Built with Gemini + Vertex AI
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
