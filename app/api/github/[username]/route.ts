import { type NextRequest, NextResponse } from "next/server";
import { fetchGitHubData } from "@/lib/github";

export const revalidate = 300; // 5 minutes

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params;

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 },
      );
    }

    if (!/^[a-zA-Z0-9-]+$/.test(username)) {
      return NextResponse.json(
        { error: "Invalid username format" },
        { status: 400 },
      );
    }

    const data = await fetchGitHubData(username);

    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("GitHub API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch GitHub data",
      },
      { status: 500 },
    );
  }
}
