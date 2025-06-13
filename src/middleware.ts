import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const authHeader = request.headers.get("authorization");

  if (path.startsWith("/api/")) {
    // if (path !== '/api/hello' && (!authHeader || !authHeader.startsWith('Bearer '))) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized access' },
    //     { status: 401 }
    //   );
    // }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
