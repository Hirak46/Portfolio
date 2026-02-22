import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { isGitHubConfigured, readFromGitHub } from "@/lib/github";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    let profileData, publicationsData, projectsData;

    if (isGitHubConfigured()) {
      // On Vercel: read from GitHub
      const [profileRaw, pubsRaw, projsRaw] = await Promise.all([
        readFromGitHub("src/data/profile.json"),
        readFromGitHub("src/data/publications.json"),
        readFromGitHub("src/data/projects.json"),
      ]);
      profileData = JSON.parse(profileRaw);
      publicationsData = JSON.parse(pubsRaw);
      projectsData = JSON.parse(projsRaw);
    } else {
      // Local development: read from filesystem
      const srcDataDir = path.join(process.cwd(), "src", "data");

      const profilePath = path.join(srcDataDir, "profile.json");
      const publicationsPath = path.join(srcDataDir, "publications.json");
      const projectsPath = path.join(srcDataDir, "projects.json");

      // Read all files
      const [profileRaw, pubsRaw, projsRaw] = await Promise.all([
        readFile(profilePath, "utf-8"),
        readFile(publicationsPath, "utf-8"),
        readFile(projectsPath, "utf-8"),
      ]);

      profileData = JSON.parse(profileRaw);
      publicationsData = JSON.parse(pubsRaw);
      projectsData = JSON.parse(projsRaw);
    }

    return NextResponse.json(
      {
        success: true,
        profile: profileData,
        publications: publicationsData,
        projects: projectsData,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
        },
      },
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to read data";
    console.error("Error reading data:", error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
