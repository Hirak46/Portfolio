import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { isGitHubConfigured, listGitHubFiles } from "@/lib/github";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let photos: Array<{ name: string; path: string; size: number }> = [];
    let cvFiles: Array<{ name: string; path: string; size: number }> = [];

    const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
    const docExtensions = [".pdf"];

    if (isGitHubConfigured()) {
      // Read from GitHub
      const [publicFiles, cvDirFiles] = await Promise.all([
        listGitHubFiles("public").catch(() => []),
        listGitHubFiles("public/cv").catch(() => []),
      ]);

      photos = publicFiles
        .filter((f) =>
          imageExtensions.some((ext) => f.name.toLowerCase().endsWith(ext)),
        )
        .map((f) => ({ name: f.name, path: f.path, size: f.size }));

      cvFiles = cvDirFiles
        .filter((f) =>
          docExtensions.some((ext) => f.name.toLowerCase().endsWith(ext)),
        )
        .map((f) => ({ name: f.name, path: f.path, size: f.size }));
    } else {
      // Read from local filesystem
      const publicDir = path.join(process.cwd(), "public");
      const cvDir = path.join(process.cwd(), "public", "cv");

      if (existsSync(publicDir)) {
        const files = await readdir(publicDir, { withFileTypes: true });
        photos = files
          .filter(
            (f) =>
              f.isFile() &&
              imageExtensions.some((ext) => f.name.toLowerCase().endsWith(ext)),
          )
          .map((f) => ({
            name: f.name,
            path: `public/${f.name}`,
            size: 0,
          }));
      }

      if (existsSync(cvDir)) {
        const files = await readdir(cvDir, { withFileTypes: true });
        cvFiles = files
          .filter(
            (f) =>
              f.isFile() &&
              docExtensions.some((ext) => f.name.toLowerCase().endsWith(ext)),
          )
          .map((f) => ({
            name: f.name,
            path: `public/cv/${f.name}`,
            size: 0,
          }));
      }
    }

    return NextResponse.json(
      {
        success: true,
        photos,
        cvFiles,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      },
    );
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("[list-files] Error:", errMsg);
    return NextResponse.json(
      { success: false, error: errMsg },
      { status: 500 },
    );
  }
}
