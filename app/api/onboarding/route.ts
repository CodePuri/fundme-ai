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
    console.error("Supabase GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  return NextResponse.json({ submitted: !!data });
}

// Helper for validating URLs
function isValidUrl(url: string | undefined): boolean {
  if (!url) return true; // Optional fields are valid if missing
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
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
    websiteUrl?: string;
    xUrl?: string;
    notes?: string;
  };

  // Input validation
  if (body.name && body.name.length > 255) return NextResponse.json({ error: "Name exceeds 255 characters" }, { status: 400 });
  if (body.role && body.role.length > 255) return NextResponse.json({ error: "Role exceeds 255 characters" }, { status: 400 });
  if (body.companyName && body.companyName.length > 255) return NextResponse.json({ error: "Company name exceeds 255 characters" }, { status: 400 });

  if (body.linkedIn && body.linkedIn.length > 500) return NextResponse.json({ error: "LinkedIn URL exceeds 500 characters" }, { status: 400 });
  if (!isValidUrl(body.linkedIn)) return NextResponse.json({ error: "Invalid LinkedIn URL" }, { status: 400 });

  if (body.websiteUrl && body.websiteUrl.length > 500) return NextResponse.json({ error: "Website URL exceeds 500 characters" }, { status: 400 });
  if (!isValidUrl(body.websiteUrl)) return NextResponse.json({ error: "Invalid Website URL" }, { status: 400 });

  if (body.xUrl && body.xUrl.length > 500) return NextResponse.json({ error: "X URL exceeds 500 characters" }, { status: 400 });
  if (!isValidUrl(body.xUrl)) return NextResponse.json({ error: "Invalid X URL" }, { status: 400 });

  if (body.notes && body.notes.length > 5000) return NextResponse.json({ error: "Notes exceed 5000 characters" }, { status: 400 });

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
        website_url: body.websiteUrl ?? null,
        x_url: body.xUrl ?? null,
        notes: body.notes ?? null,
      },
      { onConflict: "clerk_user_id" },
    );

  if (error) {
    console.error("Supabase POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
