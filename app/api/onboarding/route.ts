import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// GET /api/onboarding — check if the signed-in user has already submitted
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("onboarding_submissions")
    .select("id")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ submitted: !!data });
}

// POST /api/onboarding — save onboarding data
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;

  const body = await req.json() as {
    name?: string;
    role?: string;
    companyName?: string;
    linkedIn?: string;
    notes?: string;
  };

  const supabase = getSupabase();
  const { error } = await supabase
    .from("onboarding_submissions")
    .upsert(
      {
        clerk_user_id: userId,
        email,
        name: body.name ?? null,
        role: body.role ?? null,
        company_name: body.companyName ?? null,
        linkedin_url: body.linkedIn ?? null,
        notes: body.notes ?? null,
      },
      { onConflict: "clerk_user_id" },
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
