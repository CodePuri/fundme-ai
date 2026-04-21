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
    console.error("Database error while fetching onboarding submission:", error);
    return NextResponse.json({ error: "An internal server error occurred" }, { status: 500 });
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
    websiteUrl?: string;
    xUrl?: string;
    notes?: string;
  };

  // Input validation
  const errors: string[] = [];

  if (body.name && body.name.length > 255) errors.push("Name must be less than 255 characters");
  if (body.role && body.role.length > 255) errors.push("Role must be less than 255 characters");
  if (body.companyName && body.companyName.length > 255) errors.push("Company name must be less than 255 characters");
  if (body.notes && body.notes.length > 5000) errors.push("Notes must be less than 5000 characters");

  const validateUrl = (url: string | undefined, name: string) => {
    if (!url) return;
    if (url.length > 500) {
      errors.push(`${name} must be less than 500 characters`);
      return;
    }
    if (!url.startsWith("http:") && !url.startsWith("https:")) {
      errors.push(`${name} must start with http: or https:`);
    }
  };

  validateUrl(body.linkedIn, "LinkedIn URL");
  validateUrl(body.websiteUrl, "Website URL");
  validateUrl(body.xUrl, "X URL");

  if (errors.length > 0) {
    return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
  }

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
    console.error("Database error while upserting onboarding submission:", error);
    return NextResponse.json({ error: "An internal server error occurred" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
