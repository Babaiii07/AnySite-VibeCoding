import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function checkUser(req: NextRequest) {
  const cookieStore = await cookies();
  const hf_token = cookieStore.get("hf_token")?.value;

  if (!hf_token) {
    return NextResponse.json(
      {
        ok: false,
        message: "Unauthorized",
      },
      { status: 401 },
    );
  }

  return null;
}

export default checkUser;
