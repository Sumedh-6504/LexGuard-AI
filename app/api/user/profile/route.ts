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
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, name, avatar_url, auth_provider, plan, analyses_this_month, created_at")
      .eq("id", session.user.id)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error("Profile fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name } = body;

    if (typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const supabase = createServerClient();
    const { error } = await supabase
      .from("users")
      .update({ name: name.trim(), updated_at: new Date().toISOString() })
      .eq("id", session.user.id);

    if (error) {
      console.error("Profile update error:", error);
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServerClient();
    const userId = session.user.id;

    const { data: analyses } = await supabase
      .from("analyses")
      .select("id")
      .eq("user_id", userId);

    if (analyses && analyses.length > 0) {
      const analysisIds = analyses.map((a) => a.id);
      await supabase.from("simulations").delete().in("analysis_id", analysisIds);
      await supabase.from("findings").delete().in("analysis_id", analysisIds);
    }

    await supabase.from("analyses").delete().eq("user_id", userId);
    await supabase.from("documents").delete().eq("user_id", userId);
    await supabase.from("users").delete().eq("id", userId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Account deletion error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
