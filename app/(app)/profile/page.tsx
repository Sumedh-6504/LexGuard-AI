/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  User,
  Mail,
  Shield,
  Calendar,
  BarChart3,
  Save,
  Lock,
  Check,
  AlertCircle,
  Crown,
} from "lucide-react";
import { FREE_TIER_MONTHLY_LIMIT } from "@/lib/constants";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  auth_provider: string;
  plan: string;
  analyses_this_month: number;
  created_at: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setName(data.name || "");
        }
      } catch {
        console.error("Failed to fetch profile");
      } finally {
        setIsLoading(false);
      }
    }
    if (session?.user) fetchProfile();
  }, [session]);

  const handleSaveProfile = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setUser((prev) => prev ? { ...prev, name: name.trim() } : null);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const data = await res.json();
        setSaveError(data.error || "Failed to save");
      }
    } catch {
      setSaveError("Network error");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSuccess(false), 3000);
      } else {
        const data = await res.json();
        setPasswordError(data.error || "Failed to change password");
      }
    } catch {
      setPasswordError("Network error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-8 h-8 border-4 border-[#1a1a1a]/20 border-t-[#d2c4fb] rounded-full animate-spin" />
        <span className="text-xs font-mono font-black uppercase tracking-widest text-[#555555]">
          Loading profile...
        </span>
      </div>
    );
  }

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "—";

  const isCredentials = user?.auth_provider === "credentials";

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8 text-[#1a1a1a]">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight uppercase font-sans text-[#1a1a1a]">
          Profile
        </h1>
        <p className="text-xs font-mono tracking-wider text-[#555555] uppercase mt-1">
          Your account information
        </p>
      </div>

      {/* ── Profile Identity Card ── */}
      <div className="bg-[#ffffff] border-3 border-[#1a1a1a] neo-shadow-lg overflow-hidden">
        <div className="bg-[#1a1a1a] px-6 py-4">
          <h2 className="text-sm font-black tracking-wider uppercase text-[#ffffff] font-mono">
            Identity
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Avatar + Name row */}
          <div className="flex items-center gap-5">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={user?.name || "User"}
                className="w-16 h-16 border-3 border-[#1a1a1a] neo-shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 border-3 border-[#1a1a1a] neo-shadow-sm bg-[#ffe082] flex items-center justify-center text-xl font-black flex-shrink-0">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-lg font-extrabold uppercase tracking-tight truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs font-mono text-[#555555] truncate">{user?.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 border-2 border-[#1a1a1a] bg-[#a7ffeb] text-[9px] font-black font-mono tracking-widest uppercase">
                <Shield className="w-3 h-3" />
                {user?.auth_provider === "credentials" ? "Email" : user?.auth_provider}
              </div>
            </div>
          </div>

          {/* Editable fields */}
          <div className="border-t-2 border-[#1a1a1a]/10 pt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[11px] font-black font-mono tracking-wider text-[#1a1a1a] uppercase">
                <User className="w-3.5 h-3.5" />
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full neo-input rounded-none text-sm"
                placeholder="Your full name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[11px] font-black font-mono tracking-wider text-[#555555] uppercase">
                <Mail className="w-3.5 h-3.5" />
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full neo-input rounded-none text-sm opacity-60 cursor-not-allowed"
              />
            </div>

            {saveError && (
              <div className="flex items-start gap-2.5 p-3.5 bg-[#ff8a80] border-2 border-[#1a1a1a] text-xs font-bold text-[#1a1a1a]">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{saveError}</span>
              </div>
            )}

            {saveSuccess && (
              <div className="flex items-center gap-2.5 p-3.5 bg-[#a7ffeb] border-2 border-[#1a1a1a] text-xs font-black uppercase tracking-wider text-[#1a1a1a]">
                <Check className="w-4 h-4" />
                Profile updated successfully
              </div>
            )}

            <button
              onClick={handleSaveProfile}
              disabled={isSaving || name.trim() === (user?.name || "")}
              className="px-6 py-3 bg-[#d2c4fb] text-xs font-black tracking-wider uppercase rounded-none neo-btn flex items-center gap-2 text-[#1a1a1a] disabled:opacity-40 disabled:pointer-events-none"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-[#1a1a1a]/30 border-t-[#1a1a1a] rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Update Profile
            </button>
          </div>
        </div>
      </div>

      {/* ── Account Details Card ── */}
      <div className="bg-[#ffffff] border-3 border-[#1a1a1a] neo-shadow-lg overflow-hidden">
        <div className="bg-[#1a1a1a] px-6 py-4">
          <h2 className="text-sm font-black tracking-wider uppercase text-[#ffffff] font-mono">
            Account Details
          </h2>
        </div>

        <div className="divide-y-2 divide-[#1a1a1a]/10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-4 h-4 text-[#555555]" />
              <span className="text-xs font-black uppercase tracking-wider">Plan</span>
            </div>
            <span className="px-3 py-1 border-2 border-[#1a1a1a] bg-[#ffe082] text-[10px] font-black uppercase tracking-wider">
              {user?.plan || "free"}
            </span>
          </div>

          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-[#555555]" />
              <span className="text-xs font-black uppercase tracking-wider">Auth Provider</span>
            </div>
            <span className="text-xs font-mono text-[#555555] uppercase">
              {user?.auth_provider || "—"}
            </span>
          </div>

          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-[#555555]" />
              <span className="text-xs font-black uppercase tracking-wider">Member Since</span>
            </div>
            <span className="text-xs font-mono text-[#555555]">{memberSince}</span>
          </div>

          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-4 h-4 text-[#555555]" />
              <span className="text-xs font-black uppercase tracking-wider">Analyses This Month</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#1a1a1a]">
              {user?.analyses_this_month ?? 0} / {FREE_TIER_MONTHLY_LIMIT}
            </span>
          </div>
        </div>
      </div>

      {/* ── Change Password Card (Credentials users only) ── */}
      {isCredentials && (
        <div className="bg-[#ffffff] border-3 border-[#1a1a1a] neo-shadow-lg overflow-hidden">
          <div className="bg-[#1a1a1a] px-6 py-4">
            <h2 className="text-sm font-black tracking-wider uppercase text-[#ffffff] font-mono">
              Change Password
            </h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[11px] font-black font-mono tracking-wider text-[#1a1a1a] uppercase">
                <Lock className="w-3.5 h-3.5" />
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full neo-input rounded-none text-sm"
                placeholder="Enter current password"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[11px] font-black font-mono tracking-wider text-[#1a1a1a] uppercase">
                <Lock className="w-3.5 h-3.5" />
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full neo-input rounded-none text-sm"
                placeholder="Min 6 characters"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[11px] font-black font-mono tracking-wider text-[#1a1a1a] uppercase">
                <Lock className="w-3.5 h-3.5" />
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full neo-input rounded-none text-sm"
                placeholder="Re-enter new password"
              />
            </div>

            {passwordError && (
              <div className="flex items-start gap-2.5 p-3.5 bg-[#ff8a80] border-2 border-[#1a1a1a] text-xs font-bold text-[#1a1a1a]">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="flex items-center gap-2.5 p-3.5 bg-[#a7ffeb] border-2 border-[#1a1a1a] text-xs font-black uppercase tracking-wider text-[#1a1a1a]">
                <Check className="w-4 h-4" />
                Password changed successfully
              </div>
            )}

            <button
              onClick={handlePasswordChange}
              disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="px-6 py-3 bg-[#ffe082] text-xs font-black tracking-wider uppercase rounded-none neo-btn flex items-center gap-2 text-[#1a1a1a] disabled:opacity-40 disabled:pointer-events-none"
            >
              {isChangingPassword ? (
                <div className="w-4 h-4 border-2 border-[#1a1a1a]/30 border-t-[#1a1a1a] rounded-full animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              Update Password
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
