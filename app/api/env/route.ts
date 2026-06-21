import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    status: "ok", 
    services: {
      supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      clerk: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    }
  });
}
