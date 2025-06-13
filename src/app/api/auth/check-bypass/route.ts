import { NextRequest, NextResponse } from "next/server";
import { generateFingerprintFromHeaders } from "@/lib/inference-utils";
import { evaluateLoginBypass } from "@/lib/runtime";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const fingerprint = generateFingerprintFromHeaders(request);
  const canBypass = evaluateLoginBypass(fingerprint, true);
  return new NextResponse(String(canBypass), { status: 200 });
}
