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
    // Make auth optional for checking submission status so guests can view the form freely
    return NextResponse.json({ submitted: false });
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
  let userEmail: string | null = null;

  if (userId) {
    try {
      const user = await currentUser();
      userEmail = user?.emailAddresses?.[0]?.emailAddress ?? null;
    } catch {
      // Ignore if user fetching fails
    }
  }

  const body = await req.json() as {
    name?: string;
    role?: string;
    companyName?: string;
    email?: string;
    linkedIn?: string;
    websiteUrl?: string;
    xUrl?: string;
    notes?: string;
    voiceTranscript?: string | null;
    filesMetadata?: { name: string; size: number; type: string }[];
    sourceRoute?: string;
  };

  const resolvedEmail = body.email || userEmail || null;

  // Server-side validation: email OR LinkedIn is mandatory
  if (!resolvedEmail && !body.linkedIn) {
    return NextResponse.json(
      { error: "Email or LinkedIn URL is required" },
      { status: 400 }
    );
  }

  // Ensure stable fallback ID for guests to satisfy 'unique not null' constraints cleanly
  const actualUserId = userId || ("guest_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9));

  // Serialize the complete set of extended metadata into the existing 'notes' field
  // to ensure robust compatibility with base table schemas while capturing all data
  const extraMetadata = {
    website_url: body.websiteUrl ?? null,
    x_url: body.xUrl ?? null,
    voice_transcript: body.voiceTranscript ?? null,
    deck_file_name: body.filesMetadata?.[0]?.name ?? null,
    deck_file_size: body.filesMetadata?.[0]?.size ?? null,
    deck_file_type: body.filesMetadata?.[0]?.type ?? null,
    source_route: body.sourceRoute ?? "/onboarding",
    status: "early_access_waitlist",
  };

  const baseNotes = body.notes ? body.notes.trim() : "";
  const combinedNotes = `${baseNotes}\n\n--- Early Access Metadata ---\n${JSON.stringify(extraMetadata, null, 2)}`.trim();

  const supabase = getSupabase();
  const { error } = await supabase
    .from("onboarding_submissions")
    .upsert(
      {
        clerk_user_id: actualUserId,
        email: resolvedEmail,
        name: body.name ?? null,
        role: body.role ?? null,
        company_name: body.companyName ?? null,
        linkedin_url: body.linkedIn ?? null,
        website_url: body.websiteUrl ?? null,
        x_url: body.xUrl ?? null,
        notes: combinedNotes,
      },
      { onConflict: "clerk_user_id" },
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
