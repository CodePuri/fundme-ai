import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "This endpoint is disabled during early access." },
    { status: 410 },
  );
}
