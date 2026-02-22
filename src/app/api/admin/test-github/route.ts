import { NextResponse } from "next/server";
import { isGitHubConfigured, testGitHubConnection } from "@/lib/github";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const configured = isGitHubConfigured();

    if (!configured) {
      return NextResponse.json({
        success: false,
        configured: false,
        message:
          "GITHUB_TOKEN is not set. Running in local filesystem mode. Set GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO environment variables for GitHub integration.",
        envCheck: {
          GITHUB_TOKEN: !!process.env.GITHUB_TOKEN,
          GITHUB_OWNER:
            process.env.GITHUB_OWNER || "(not set, defaults to Hirak46)",
          GITHUB_REPO:
            process.env.GITHUB_REPO || "(not set, defaults to Portfolio)",
        },
      });
    }

    const result = await testGitHubConnection();

    const token = process.env.GITHUB_TOKEN || "";
    const tokenType = token.startsWith("ghp_")
      ? "classic (ghp_*)"
      : token.startsWith("github_pat_")
        ? "fine-grained (github_pat_*)"
        : `unknown (starts with '${token.substring(0, 4)}...')`;

    return NextResponse.json({
      ...result,
      configured: true,
      tokenType,
      envCheck: {
        GITHUB_TOKEN: `set (${tokenType})`,
        GITHUB_OWNER:
          process.env.GITHUB_OWNER || "(not set, defaults to Hirak46)",
        GITHUB_REPO:
          process.env.GITHUB_REPO || "(not set, defaults to Portfolio)",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
