import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://anysite-gallery.parthib.ai";

export async function POST(request: NextRequest) {
  try {
    const { filename, code } = await request.json();

    const response = await fetch(`${BASE_URL}/api/upload-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-token": process.env.ANYSITE_GALLERY_AUTH_TOKEN || "",
      },
      body: JSON.stringify({
        filename,
        code,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: `Failed to upload: ${response.status} ${response.statusText}`,
        },
        { status: response.status },
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in share-link API:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
