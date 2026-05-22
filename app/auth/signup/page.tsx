/**
 * Custom Sign-Up Page
 * Matches the LexGuard Retro Neo-Brutalist Figma UI/UX specification.
 */

"use client";

import React, { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

/** SVG icons for OAuth providers. */
function GoogleIcon() {
  return (
    <svg className="w-5 h-5 text-[#1a1a1a]" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="w-5 h-5 text-[#1a1a1a]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
    </svg>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}

function SignUpForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create account. Please try again.");
      } else {
        setSuccess("Account created successfully! Redirecting to sign in...");
        setTimeout(() => {
          router.push(`/auth/signin?email=${encodeURIComponent(email)}`);
        }, 2000);
      }
    } catch {
      setError("Something went wrong. Please check your network and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = (provider: "google" | "github") => {
    signIn(provider, { callbackUrl: "/dashboard" });
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#f5f4f0] text-[#111111]">
      <div className="w-full max-w-md space-y-6">
        {/* ── Sign-up Card ── */}
        <div className="bg-[#ffffff] border-3 border-[#1a1a1a] p-8 neo-shadow-lg flex flex-col space-y-5">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight uppercase font-sans text-[#1a1a1a]">
              Create Account
            </h1>
            <p className="text-xs font-mono text-[#555555] uppercase">
              Start protecting yourself from predatory contracts
            </p>
          </div>

          {/* Success Banner */}
          {success && (
            <div className="flex items-start gap-2.5 p-3.5 bg-[#a7ffeb] border-2 border-[#1a1a1a] text-xs font-bold text-[#1a1a1a]">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* OAuth Buttons (Side-by-Side) */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleOAuth("google")}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-[#ffffff] text-xs font-black tracking-wider uppercase rounded-none border-2 border-[#1a1a1a] neo-shadow-sm hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#1a1a1a] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#1a1a1a] transition-all duration-100"
            >
              <GoogleIcon />
              Google
            </button>

            <button
              onClick={() => handleOAuth("github")}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-[#ffffff] text-xs font-black tracking-wider uppercase rounded-none border-2 border-[#1a1a1a] neo-shadow-sm hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#1a1a1a] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#1a1a1a] transition-all duration-100"
            >
              <GitHubIcon />
              GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t-2 border-[#1a1a1a]"></div>
            <span className="flex-shrink mx-4 text-[10px] font-black font-mono tracking-widest text-[#1a1a1a] uppercase">
              or
            </span>
            <div className="flex-grow border-t-2 border-[#1a1a1a]"></div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name field */}
            <div className="space-y-1">
              <label className="block text-[11px] font-black font-mono tracking-wider text-[#1a1a1a] uppercase">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                disabled={isLoading}
                className="w-full neo-input rounded-none text-sm placeholder:text-[#888888]"
              />
            </div>

            {/* Email field */}
            <div className="space-y-1">
              <label className="block text-[11px] font-black font-mono tracking-wider text-[#1a1a1a] uppercase">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={isLoading}
                className="w-full neo-input rounded-none text-sm placeholder:text-[#888888]"
              />
            </div>

            {/* Password field */}
            <div className="space-y-1">
              <label className="block text-[11px] font-black font-mono tracking-wider text-[#1a1a1a] uppercase">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="w-full neo-input rounded-none text-sm placeholder:text-[#888888]"
              />
            </div>

            {/* Confirm Password field */}
            <div className="space-y-1">
              <label className="block text-[11px] font-black font-mono tracking-wider text-[#1a1a1a] uppercase">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="w-full neo-input rounded-none text-sm placeholder:text-[#888888]"
              />
            </div>

            {/* Error Banner */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-[#ff8a80] border-2 border-[#1a1a1a] text-xs font-bold text-[#1a1a1a]">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !!success}
              className="w-full py-4 bg-[#d2c4fb] text-sm font-black tracking-wider uppercase rounded-none neo-btn flex items-center justify-center gap-2 text-[#1a1a1a] mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-[#1a1a1a]/30 border-t-[#1a1a1a] rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Already have an account? */}
          <div className="flex items-center gap-2 justify-center text-xs pt-2 border-t-2 border-[#1a1a1a]/10">
            <span className="font-mono text-[#555555] uppercase">Already have an account?</span>
            <a
              href="/auth/signin"
              className="font-black text-[#1a1a1a] underline decoration-2 hover:text-[#d2c4fb] transition-all"
            >
              Sign In
            </a>
          </div>
        </div>

        {/* Back to home */}
        <p className="text-center">
          <Link
            href="/"
            className="text-xs font-black font-mono tracking-widest uppercase text-[#555555] hover:text-[#1a1a1a] hover:underline"
          >
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
