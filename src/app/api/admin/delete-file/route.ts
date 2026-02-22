import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { isGitHubConfigured, deleteFromGitHub } from "@/lib/github";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filePath, category } = body;

    if (!filePath) {
      return NextResponse.json(
        { success: false, error: "filePath is required" },
        { status: 400 },
      );
    }

    // Security: only allow deleting from public/ and public/cv/
    const sanitizedPath = filePath.replace(/\.\./g, "").replace(/^\/+/, "");
    if (
      !sanitizedPath.startsWith("public/") &&
      !sanitizedPath.startsWith("public\\")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Can only delete files from public/ directory",
        },
        { status: 403 },
      );
    }

    if (isGitHubConfigured()) {
      console.log(`[delete-file] Deleting ${sanitizedPath} from GitHub...`);
      await deleteFromGitHub(
        sanitizedPath,
        `Delete ${category || "file"}: ${path.basename(sanitizedPath)} via admin panel`,
      );
      console.log(
        `[delete-file] Successfully deleted ${sanitizedPath} from GitHub`,
      );
    } else {
      // Production serverless: filesystem is read-only
      return NextResponse.json(
        {
          success: false,
          error:
            "GitHub integration is not configured. Set GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO environment variables to enable file deletion.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: isGitHubConfigured()
          ? `File deleted from GitHub! Site will update in ~30 seconds.`
          : `File deleted locally.`,
        deletedPath: sanitizedPath,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      },
    );
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("[delete-file] Error:", errMsg);
    return NextResponse.json(
      { success: false, error: errMsg },
      { status: 500 },
    );
  }
}
