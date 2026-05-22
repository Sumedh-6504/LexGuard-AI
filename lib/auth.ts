/**
 * NextAuth.js v5 configuration for LexGuard.
 *
 * Authentication providers:
 *   1. Google OAuth  — for individual users
 *   2. GitHub OAuth  — for developer users
 *   3. Credentials   — email + password (queries Supabase + hashes with bcrypt)
 *
 * Session strategy: JWT (stateless — no DB session table required).
 * The JWT stores the user's id, email, name, and avatar so every
 * server component / API route can access identity without a DB call.
 *
 * User sync: On first sign-in, a row is upserted into the Supabase
 * `users` table. The user ID stored in the JWT is a deterministic UUID
 * derived from the user's email, ensuring consistency across OAuth and Credentials.
 */

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { createServerClient } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";

/**
 * Generate a deterministic UUID v5-like ID from an email.
 * This ensures the same user always gets the same UUID regardless
 * of which provider they use, enabling consistent FK references.
 */
function emailToUUID(email: string): string {
  // Simple deterministic hash → UUID format
  let hash = 0;
  const str = `lexguard:${email.toLowerCase()}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  // Pad to create a valid UUID v4 format
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return [
    hex.slice(0, 8),
    hex.slice(0, 4),
    "4" + hex.slice(1, 4),
    "8" + hex.slice(0, 3),
    hex.padEnd(12, "0").slice(0, 12),
  ].join("-");
}

const authConfig: NextAuthConfig = {
  trustHost: true,
  /**
   * Providers — evaluated in declaration order.
   * Google / GitHub use environment variables automatically:
   *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
   *   GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
   */
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID || process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET || process.env.AUTH_GITHUB_SECRET,
    }),
    Credentials({
      name: "Email",
      credentials: {
        email:    { label: "Email",    type: "email",    placeholder: "you@example.com" },
        password: { label: "Password", type: "password", placeholder: "••••••••" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        try {
          const supabase = createServerClient();

          // Query the user by email
          const { data: user, error } = await supabase
            .from("users")
            .select("id, email, name, password_hash")
            .eq("email", email.toLowerCase())
            .maybeSingle();

          if (error || !user) {
            console.warn("Auth attempt: user not found or DB error:", email);
            return null;
          }

          // If the user signed up via Google/GitHub and has no password hash
          if (!user.password_hash) {
            console.warn("Auth attempt: user exists but has no password (OAuth-only account):", email);
            return null;
          }

          // Verify the password hash
          const isPasswordValid = await bcrypt.compare(password, user.password_hash);
          if (!isPasswordValid) {
            console.warn("Auth attempt: invalid password for:", email);
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        } catch (err) {
          console.error("Authorize function error:", err);
          return null;
        }
      },
    }),
  ],

  /** Custom pages — override the default NextAuth sign-in page. */
  pages: {
    signIn: "/auth/signin",
  },

  /** JWT-based sessions — stateless, no database session table needed. */
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  /**
   * Callbacks — enrich the JWT and session with user identity.
   * For OAuth providers, we override the generated ID with a
   * deterministic UUID based on email for consistent FK references.
   */
  callbacks: {
    async signIn({ user, account }) {
      if (user?.email) {
        const userId = emailToUUID(user.email);
        try {
          const supabase = createServerClient();
          const { error } = await supabase.from("users").upsert(
            {
              id: userId,
              email: user.email.toLowerCase(),
              name: user.name ?? null,
              avatar_url: user.image ?? null,
              auth_provider: account?.provider ?? "credentials",
              plan: "free",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any,
            { onConflict: "id" }
          );
          if (error) {
            console.error("Supabase user sync error on sign-in:", error);
          }
        } catch (err) {
          console.error("Supabase user sync failed on sign-in:", err);
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user?.email) {
        token.id = emailToUUID(user.email);
        token.provider = account?.provider ?? "credentials";
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
