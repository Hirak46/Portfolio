import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import {
  isGitHubConfigured,
  readFromGitHub,
  commitToGitHub,
} from "@/lib/github";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("cv") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse PDF or LaTeX
    let cvText = "";
    if (file.type === "application/pdf") {
      try {
        const pdfParse = require("pdf-parse");
        const pdfData = await pdfParse(buffer);
        cvText = pdfData.text;
      } catch (pdfError: any) {
        console.error("PDF parsing error:", pdfError);
        // Fallback: try reading as text
        cvText = buffer.toString("utf-8");
        if (!cvText || cvText.includes("\x00")) {
          return NextResponse.json(
            {
              error:
                "Failed to parse PDF. Make sure pdf-parse is installed: npm install pdf-parse",
            },
            { status: 500 },
          );
        }
      }
    } else {
      // For LaTeX files
      cvText = buffer.toString("utf-8");
    }

    // Extract information using regex patterns
    const extractedData = extractCVData(cvText);

    // Read current profile (GitHub or local)
    let currentProfile: any;
    if (isGitHubConfigured()) {
      const profileRaw = await readFromGitHub("src/data/profile.json");
      currentProfile = JSON.parse(profileRaw);
    } else {
      const profilePath = join(process.cwd(), "src", "data", "profile.json");
      currentProfile = JSON.parse(await readFile(profilePath, "utf-8"));
    }

    // Merge extracted data with current profile
    const updatedProfile = {
      ...currentProfile,
      ...extractedData,
      skills: extractedData.skills || currentProfile.skills,
      certifications:
        extractedData.certifications || currentProfile.certifications,
      volunteer: extractedData.volunteer || currentProfile.volunteer,
      awards: extractedData.awards || currentProfile.awards,
      memberships: extractedData.memberships || currentProfile.memberships,
      reviewExperience:
        extractedData.reviewExperience || currentProfile.reviewExperience,
    };

    // Save updated profile
    const profileJson = JSON.stringify(updatedProfile, null, 2);

    if (isGitHubConfigured()) {
      await commitToGitHub(
        [
          { path: "src/data/profile.json", content: profileJson },
          { path: "public/data/profile.json", content: profileJson },
        ],
        "Update profile from CV upload",
      );
    } else {
      const srcDataDir = join(process.cwd(), "src", "data");
      const publicDataDir = join(process.cwd(), "public", "data");

      if (!existsSync(srcDataDir)) {
        await mkdir(srcDataDir, { recursive: true });
      }
      if (!existsSync(publicDataDir)) {
        await mkdir(publicDataDir, { recursive: true });
      }

      await Promise.all([
        writeFile(join(srcDataDir, "profile.json"), profileJson, "utf-8"),
        writeFile(join(publicDataDir, "profile.json"), profileJson, "utf-8"),
      ]);
    }

    return NextResponse.json(
      {
        success: true,
        message: "CV processed successfully",
        extractedData,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("Error parsing CV:", error);
    return NextResponse.json(
      {
        error: "Failed to process CV",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

function extractCVData(text: string): any {
  const data: any = {};

  // Extract email
  const emailMatch = text.match(
    /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/,
  );
  if (emailMatch) {
    data.email = emailMatch[1];
  }

  // Extract phone
  const phoneMatch = text.match(/(\+?\d{10,15})/);
  if (phoneMatch) {
    data.phone = phoneMatch[1];
  }

  // Extract name (usually appears early in CV)
  const lines = text.split("\n");
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].trim();
    if (line.length > 3 && line.length < 50 && /^[A-Z]/.test(line)) {
      if (!line.includes("@") && !line.includes("http")) {
        data.name = line;
        break;
      }
    }
  }

  // Extract certifications
  if (text.includes("CERTIFICATION") || text.includes("Certificate")) {
    const certSection = text.match(
      /CERTIFICATION[S]?[\s\S]*?(?=\n\n[A-Z]{3,}|$)/i,
    );
    if (certSection) {
      const certs = certSection[0].match(/•\s*(.+?)(?=\n|$)/g);
      if (certs) {
        data.certifications = certs.map((c) => c.replace("•", "").trim());
      }
    }
  }

  // Extract skills
  if (text.includes("SKILL")) {
    data.skills = {};

    const programmingMatch = text.match(/Programming[:\s]+(.+?)(?=\n[A-Z]|$)/i);
    if (programmingMatch) {
      data.skills.programming = programmingMatch[1]
        .split(",")
        .map((s) => s.trim());
    }

    const languagesMatch = text.match(/Languages[:\s]+(.+?)(?=\n[A-Z]|$)/i);
    if (languagesMatch) {
      data.skills.languages = languagesMatch[1].split(",").map((s) => s.trim());
    }
  }

  // Extract volunteer experience
  if (text.includes("VOLUNTEER")) {
    const volSection = text.match(
      /VOLUNTEER[S\s\w]*?[\s\S]*?(?=\n\n[A-Z]{3,}|$)/i,
    );
    if (volSection) {
      const vols = volSection[0].match(/•\s*(.+?)(?=\n|$)/g);
      if (vols) {
        data.volunteer = vols.map((v) => v.replace("•", "").trim());
      }
    }
  }

  return data;
}
