import { NextResponse } from "next/server";
import { REDIRECT_URI } from "@/lib/constants";
export const dynamic = "force-dynamic";

export async function GET() {
  const url = `https://huggingface.co/oauth/authorize?client_id=${process.env.OAUTH_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=openid%20profile%20inference-api&prompt=consent&state=1234567890`;

  return NextResponse.redirect(url);
}
