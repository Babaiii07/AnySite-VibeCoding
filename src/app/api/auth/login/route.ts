import { NextRequest, NextResponse } from "next/server";
import { REDIRECT_URI } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");

  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || "http";
  const baseUrl = `${protocol}://${host}`;

  if (!code) {
    return NextResponse.redirect(new URL("/", baseUrl));
  }

  const Authorization = `Basic ${Buffer.from(
    `${process.env.OAUTH_CLIENT_ID}:${process.env.OAUTH_CLIENT_SECRET}`,
  ).toString("base64")}`;

  try {
    const request_auth = await fetch("https://huggingface.co/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const response = await request_auth.json();
    if (!response.access_token) {
      return NextResponse.redirect(new URL("/", baseUrl));
    }

    const res = NextResponse.redirect(new URL("/", baseUrl));
    res.cookies.set("hf_token", response.access_token, {
      httpOnly: false,
      secure: true,
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.redirect(new URL("/", baseUrl));
  }
}
