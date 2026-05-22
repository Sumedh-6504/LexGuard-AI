/**
 * POST /api/auth/signup
 *
 * Registers a new credentials-based user:
 *   1. Validates inputs (email, password, name)
 *   2. Hashes the password securely using bcryptjs
 *   3. Inserts a new row into the Supabase `users` table
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";

/**
 * Generate a deterministic UUID v5-like ID from an email.
 * Matches the deterministic ID generation in lib/auth.ts
 */
function emailToUUID(email: string): string {
  let hash = 0;
  const str = `lexguard:${email.toLowerCase()}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return [
    hex.slice(0, 8),
    hex.slice(0, 4),
    "4" + hex.slice(1, 4),
    "8" + hex.slice(0, 3),
    hex.padEnd(12, "0").slice(0, 12),
  ].join("-");
}

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields: email, password, name" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate a deterministic UUID for consistency
    const userId = emailToUUID(email);

    // Insert user into Supabase
    const { error: insertErr } = await supabase
      .from("users")
      .insert({
        id: userId,
        email: email.toLowerCase(),
        name,
        auth_provider: "credentials",
        plan: "free",
        // Note: Make sure to run: ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
        password_hash: passwordHash,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

    if (insertErr) {
      console.error("Supabase signup error:", insertErr);
      return NextResponse.json(
        { error: "Failed to create user account. Database error." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "User account created successfully" },
      { status: 201 }
    );
  } catch (err) {
    console.error("Signup API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
