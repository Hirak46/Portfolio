import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import {
  isGitHubConfigured,
  readFromGitHub,
  commitToGitHub,
} from "@/lib/github";

export const dynamic = "force-dynamic";

interface ScholarStats {
  totalCitations: number;
  citationsSince2021: number;
  hIndex: number;
  hIndexSince2021: number;
  i10Index: number;
  i10IndexSince2021: number;
  lastUpdated: string;
}

interface ScholarPublication {
  title: string;
  authors: string;
  venue: string;
  year: number;
  citations: number;
  link: string;
}

/**
 * Fetch and parse Google Scholar profile page
 */
async function fetchScholarProfile(scholarId: string): Promise<{
  stats: ScholarStats;
  publications: ScholarPublication[];
  name: string;
}> {
  const url = `https://scholar.google.com/citations?user=${scholarId}&hl=en&cstart=0&pagesize=100`;

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Google Scholar page: ${response.status}`);
  }

  const html = await response.text();

  // Parse citation stats from the table
  // Google Scholar stats table has class "gsc_rsb_std"
  const statsRegex = /<td\s+class="gsc_rsb_std"[^>]*>(\d+)<\/td>/g;
  const statsMatches: number[] = [];
  let match;
  while ((match = statsRegex.exec(html)) !== null) {
    statsMatches.push(parseInt(match[1], 10));
  }

  // Stats table layout: [citationsAll, citationsSince, hIndexAll, hIndexSince, i10All, i10Since]
  const stats: ScholarStats = {
    totalCitations: statsMatches[0] || 0,
    citationsSince2021: statsMatches[1] || 0,
    hIndex: statsMatches[2] || 0,
    hIndexSince2021: statsMatches[3] || 0,
    i10Index: statsMatches[4] || 0,
    i10IndexSince2021: statsMatches[5] || 0,
    lastUpdated: new Date().toISOString().split("T")[0],
  };

  // Parse author name
  const nameMatch = html.match(/<div\s+id="gsc_prf_in"[^>]*>([^<]+)<\/div>/);
  const name = nameMatch ? nameMatch[1].trim() : "";

  // Parse publications
  const publications: ScholarPublication[] = [];
  const pubRegex =
    /<tr\s+class="gsc_a_tr"[^>]*>[\s\S]*?<a[^>]*class="gsc_a_at"[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>[\s\S]*?<div\s+class="gs_gray">([^<]*)<\/div>[\s\S]*?<div\s+class="gs_gray">([^<]*)<\/div>[\s\S]*?<a[^>]*class="gsc_a_ac[^"]*"[^>]*>(\d*)<\/a>[\s\S]*?<span[^>]*class="gsc_a_h[^"]*"[^>]*>(\d*)<\/span>/g;

  while ((match = pubRegex.exec(html)) !== null) {
    publications.push({
      link: match[1] ? `https://scholar.google.com${match[1]}` : "",
      title: decodeHtmlEntities(match[2].trim()),
      authors: decodeHtmlEntities(match[3].trim()),
      venue: decodeHtmlEntities(match[4].trim()),
      citations: match[5] ? parseInt(match[5], 10) : 0,
      year: match[6] ? parseInt(match[6], 10) : 0,
    });
  }

  // Fallback: try simpler pub parsing if regex didn't match
  if (publications.length === 0) {
    const simplePubRegex = /<a[^>]*class="gsc_a_at"[^>]*>([^<]+)<\/a>/g;
    const pubTitles: string[] = [];
    while ((match = simplePubRegex.exec(html)) !== null) {
      pubTitles.push(decodeHtmlEntities(match[1].trim()));
    }

    // Try to extract citation counts
    const citRegex = /<a[^>]*class="gsc_a_ac\s*gs_ibl"[^>]*>(\d*)<\/a>/g;
    const citCounts: number[] = [];
    while ((match = citRegex.exec(html)) !== null) {
      citCounts.push(match[1] ? parseInt(match[1], 10) : 0);
    }

    // Try to extract years
    const yearRegex =
      /<span[^>]*class="gsc_a_h\s*gsc_a_hc\s*gs_ibl"[^>]*>(\d*)<\/span>/g;
    const years: number[] = [];
    while ((match = yearRegex.exec(html)) !== null) {
      years.push(match[1] ? parseInt(match[1], 10) : 0);
    }

    for (let i = 0; i < pubTitles.length; i++) {
      publications.push({
        title: pubTitles[i],
        authors: "",
        venue: "",
        citations: citCounts[i] || 0,
        year: years[i] || 0,
        link: "",
      });
    }
  }

  return { stats, publications, name };
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&hellip;/g, "…")
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scholarId, updateProfile = true, updatePublications = true } = body;

    if (!scholarId) {
      return NextResponse.json(
        { success: false, error: "Scholar ID is required" },
        { status: 400 },
      );
    }

    // Fetch data from Google Scholar
    const scholarData = await fetchScholarProfile(scholarId);

    if (
      scholarData.stats.totalCitations === 0 &&
      scholarData.publications.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Could not retrieve data from Google Scholar. The profile may be private or Google may be blocking the request. Try again later.",
        },
        { status: 422 },
      );
    }

    let updatedProfile = null;
    let updatedPublications = null;
    const changes: string[] = [];

    // Read current data
    let currentProfile: Record<string, unknown>;
    let currentPublications: Array<Record<string, unknown>>;

    if (isGitHubConfigured()) {
      const [profileRaw, pubsRaw] = await Promise.all([
        readFromGitHub("src/data/profile.json"),
        readFromGitHub("src/data/publications.json"),
      ]);
      currentProfile = JSON.parse(profileRaw);
      currentPublications = JSON.parse(pubsRaw);
    } else {
      const srcDataDir = path.join(process.cwd(), "src", "data");
      const [profileRaw, pubsRaw] = await Promise.all([
        readFile(path.join(srcDataDir, "profile.json"), "utf-8"),
        readFile(path.join(srcDataDir, "publications.json"), "utf-8"),
      ]);
      currentProfile = JSON.parse(profileRaw);
      currentPublications = JSON.parse(pubsRaw);
    }

    // Update profile stats
    if (updateProfile) {
      const oldStats = (currentProfile.stats as Record<string, number>) || {};
      const oldScholarStats =
        (currentProfile.scholarStats as Record<string, unknown>) || {};

      currentProfile.stats = {
        publications:
          scholarData.publications.length > 0
            ? scholarData.publications.length
            : oldStats.publications || 0,
        citations: scholarData.stats.totalCitations || oldStats.citations || 0,
        hIndex: scholarData.stats.hIndex || oldStats.hIndex || 0,
        i10Index: scholarData.stats.i10Index || oldStats.i10Index || 0,
      };

      currentProfile.scholarStats = {
        totalCitations: scholarData.stats.totalCitations,
        citationsSince2021: scholarData.stats.citationsSince2021,
        hIndex: scholarData.stats.hIndex,
        hIndexSince2021: scholarData.stats.hIndexSince2021,
        i10Index: scholarData.stats.i10Index,
        i10IndexSince2021: scholarData.stats.i10IndexSince2021,
        lastUpdated: scholarData.stats.lastUpdated,
      };

      changes.push(
        `📊 Stats updated: ${scholarData.stats.totalCitations} citations, h-index: ${scholarData.stats.hIndex}, i10-index: ${scholarData.stats.i10Index}`,
      );

      if (
        oldStats.citations &&
        oldStats.citations !== scholarData.stats.totalCitations
      ) {
        changes.push(
          `📈 Citations changed: ${oldStats.citations} → ${scholarData.stats.totalCitations}`,
        );
      }

      updatedProfile = currentProfile;
    }

    // Update publications
    if (updatePublications && scholarData.publications.length > 0) {
      // Merge: update citation counts for existing pubs, add new ones
      const existingPubs = [...currentPublications];
      let newCount = 0;
      let updatedCount = 0;

      for (const scholarPub of scholarData.publications) {
        // Find matching existing publication by title similarity
        const existingIdx = existingPubs.findIndex((p) => {
          const existingTitle = String(p.title || "")
            .toLowerCase()
            .trim();
          const scholarTitle = scholarPub.title.toLowerCase().trim();
          return (
            existingTitle === scholarTitle ||
            existingTitle.includes(scholarTitle) ||
            scholarTitle.includes(existingTitle) ||
            similarityScore(existingTitle, scholarTitle) > 0.8
          );
        });

        if (existingIdx >= 0) {
          // Update citation count
          const oldCitations = existingPubs[existingIdx].citations as number;
          if (scholarPub.citations !== oldCitations) {
            existingPubs[existingIdx].citations = scholarPub.citations;
            updatedCount++;
          }
          // Update year if missing
          if (!existingPubs[existingIdx].year && scholarPub.year) {
            existingPubs[existingIdx].year = scholarPub.year;
          }
        } else {
          // New publication found on Scholar
          const newPub = {
            id: `scholar-${Date.now()}-${newCount}`,
            title: scholarPub.title,
            authors: scholarPub.authors
              ? scholarPub.authors.split(",").map((a: string) => a.trim())
              : [currentProfile.name || "Unknown"],
            venue: scholarPub.venue || "Unknown",
            year: scholarPub.year || new Date().getFullYear(),
            citations: scholarPub.citations,
            pdf: scholarPub.link || "",
            doi: "",
            abstract: "",
            type: "journal",
            impactFactor: "",
          };
          existingPubs.push(newPub);
          newCount++;
        }
      }

      if (updatedCount > 0) {
        changes.push(
          `🔄 Updated citation counts for ${updatedCount} publications`,
        );
      }
      if (newCount > 0) {
        changes.push(
          `📄 Added ${newCount} new publications from Google Scholar`,
        );
      }

      updatedPublications = existingPubs;
    }

    // Save updated data
    if (updatedProfile || updatedPublications) {
      const profileJson = JSON.stringify(
        updatedProfile || currentProfile,
        null,
        2,
      );
      const publicationsJson = JSON.stringify(
        updatedPublications || currentPublications,
        null,
        2,
      );

      if (isGitHubConfigured()) {
        const files = [
          { path: "src/data/profile.json", content: profileJson },
          { path: "public/data/profile.json", content: profileJson },
          { path: "src/data/publications.json", content: publicationsJson },
          { path: "public/data/publications.json", content: publicationsJson },
        ];
        await commitToGitHub(files, "Auto-update from Google Scholar");
      } else {
        // Production serverless: filesystem is read-only
        return NextResponse.json(
          {
            success: false,
            error:
              "GitHub integration is not configured. Set GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO environment variables to save Scholar data.",
          },
          { status: 503 },
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Google Scholar data fetched and updated successfully!",
        changes,
        stats: scholarData.stats,
        publicationsFound: scholarData.publications.length,
        scholarName: scholarData.name,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      },
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch Scholar data";
    console.error("Error fetching Scholar data:", error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}

/**
 * Simple string similarity score (Jaccard-like on words)
 */
function similarityScore(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter(Boolean));
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter(Boolean));
  const intersection = new Set([...wordsA].filter((w) => wordsB.has(w)));
  const union = new Set([...wordsA, ...wordsB]);
  return union.size > 0 ? intersection.size / union.size : 0;
}
