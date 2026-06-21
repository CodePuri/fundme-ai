import { NextResponse } from "next/server";
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ status: "ok", environment: "production" });
  }

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const safeKey = key ? `${key.substring(0, 10)}...${key.substring(key.length - 5)}` : "not set";

  return NextResponse.json({ 
    status: "ok", 
    environment: process.env.NODE_ENV,
    keyConfigured: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    keyPreview: safeKey
  });
}
