import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { existsSync } from "fs";
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
      // Local: delete from filesystem
      const fullPath = path.join(process.cwd(), sanitizedPath);
      if (existsSync(fullPath)) {
        await unlink(fullPath);
        console.log(`[delete-file] Deleted ${fullPath} locally`);
      } else {
        return NextResponse.json(
          { success: false, error: "File not found" },
          { status: 404 },
        );
      }
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
