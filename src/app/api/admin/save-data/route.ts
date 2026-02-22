import { NextRequest, NextResponse } from "next/server";
import { isGitHubConfigured, commitToGitHub } from "@/lib/github";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile, publications, projects } = body;

    if (!profile || !publications || !projects) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required data fields (profile, publications, projects)",
        },
        { status: 400 },
      );
    }

    // Sanitize JSON: remove any undefined values and ensure valid JSON
    const profileJson = JSON.stringify(
      JSON.parse(JSON.stringify(profile)),
      null,
      2,
    );
    const publicationsJson = JSON.stringify(
      JSON.parse(JSON.stringify(publications)),
      null,
      2,
    );
    const projectsJson = JSON.stringify(
      JSON.parse(JSON.stringify(projects)),
      null,
      2,
    );

    if (isGitHubConfigured()) {
      // On Vercel: commit to GitHub → triggers auto-redeploy
      console.log("[save-data] GitHub is configured, committing to GitHub...");
      try {
        await commitToGitHub(
          [
            { path: "src/data/profile.json", content: profileJson },
            { path: "public/data/profile.json", content: profileJson },
            { path: "src/data/publications.json", content: publicationsJson },
            {
              path: "public/data/publications.json",
              content: publicationsJson,
            },
            { path: "src/data/projects.json", content: projectsJson },
            { path: "public/data/projects.json", content: projectsJson },
          ],
          "Update portfolio data via admin panel",
        );

        console.log("[save-data] Successfully committed to GitHub");
        return NextResponse.json(
          {
            success: true,
            message:
              "Data saved to GitHub! Your site will auto-update in ~30 seconds.",
          },
          {
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
            },
          },
        );
      } catch (githubError) {
        const errMsg =
          githubError instanceof Error
            ? githubError.message
            : String(githubError);
        console.error("[save-data] GitHub commit failed:", errMsg);
        return NextResponse.json(
          {
            success: false,
            error: `GitHub save failed: ${errMsg}. Please check your GITHUB_TOKEN has 'repo' or 'contents:write' permissions.`,
          },
          { status: 500 },
        );
      }
    } else {
      // Production serverless: filesystem is read-only
      console.warn(
        "[save-data] GitHub not configured, cannot write in production.",
      );
      return NextResponse.json(
        {
          success: false,
          error:
            "GitHub integration is not configured. Set GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO environment variables to enable saving.",
        },
        { status: 503 },
      );
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to save data";
    console.error("[save-data] Error:", error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
