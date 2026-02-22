import { NextRequest, NextResponse } from "next/server";
import {
  isGitHubConfigured,
  uploadBinaryToGitHub,
  sanitizeFileName,
} from "@/lib/github";

export const dynamic = "force-dynamic";

// Allowed file types
const ALLOWED_TYPES: Record<string, string[]> = {
  image: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
  ],
  document: ["application/pdf"],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const category = formData.get("category") as string; // "photo-home", "photo-about", "cv"
    const customName = formData.get("filename") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 },
      );
    }

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: "Category is required (photo-home, photo-about, cv)",
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 10MB." },
        { status: 400 },
      );
    }

    // Determine target path and validate type
    let targetDir: string;
    let allowedTypes: string[];
    let fileName: string;

    switch (category) {
      case "photo-home":
        targetDir = "public";
        allowedTypes = ALLOWED_TYPES.image;
        // Keep original extension
        const homeExt = getExtension(file.name);
        fileName = customName || `Hirak${homeExt}`;
        break;
      case "photo-about":
        targetDir = "public";
        allowedTypes = ALLOWED_TYPES.image;
        const aboutExt = getExtension(file.name);
        fileName = customName || `Abou${aboutExt}`;
        break;
      case "cv":
        targetDir = "public/cv";
        allowedTypes = ALLOWED_TYPES.document;
        // Sanitize the CV filename to remove spaces, parentheses, etc.
        const rawName = customName || file.name;
        const ext = getExtension(rawName);
        const nameWithoutExt = rawName.substring(
          0,
          rawName.length - ext.length,
        );
        fileName = sanitizeFileName(nameWithoutExt) + ext;
        break;
      default:
        return NextResponse.json(
          { success: false, error: `Invalid category: ${category}` },
          { status: 400 },
        );
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type: ${file.type}. Allowed: ${allowedTypes.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Convert file to buffer/base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Content = buffer.toString("base64");

    const filePath = `${targetDir}/${fileName}`;

    if (isGitHubConfigured()) {
      // Upload to GitHub
      console.log(`[upload-file] Uploading ${filePath} to GitHub...`);
      await uploadBinaryToGitHub(
        filePath,
        base64Content,
        `Upload ${category}: ${fileName} via admin panel`,
      );
      console.log(`[upload-file] Successfully uploaded ${filePath} to GitHub`);
    } else {
      // Production serverless: filesystem is read-only
      return NextResponse.json(
        {
          success: false,
          error:
            "GitHub integration is not configured. Set GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO environment variables to enable file uploads.",
        },
        { status: 503 },
      );
    }

    // Determine the public URL path
    let publicPath: string;
    if (category === "cv") {
      publicPath = `/cv/${fileName}`;
    } else {
      publicPath = `/${fileName}`;
    }

    return NextResponse.json(
      {
        success: true,
        message: isGitHubConfigured()
          ? `File uploaded to GitHub! Site will update in ~30 seconds.`
          : `File saved locally.`,
        fileName,
        filePath: publicPath,
        category,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      },
    );
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("[upload-file] Error:", errMsg);
    return NextResponse.json(
      { success: false, error: errMsg },
      { status: 500 },
    );
  }
}

function getExtension(filename: string): string {
  const ext = filename.lastIndexOf(".");
  if (ext === -1) return "";
  return filename.substring(ext);
}
