import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { isGitHubConfigured, commitToGitHub } from '@/lib/github';

export async function POST(request: NextRequest) {
  try {
    const { profile, publications, projects } = await request.json();

    const profileJson = JSON.stringify(profile, null, 2);
    const publicationsJson = JSON.stringify(publications, null, 2);
    const projectsJson = JSON.stringify(projects, null, 2);

    if (isGitHubConfigured()) {
      // On Vercel: commit to GitHub → triggers auto-redeploy
      await commitToGitHub(
        [
          { path: 'src/data/profile.json', content: profileJson },
          { path: 'public/data/profile.json', content: profileJson },
          { path: 'src/data/publications.json', content: publicationsJson },
          { path: 'public/data/publications.json', content: publicationsJson },
          { path: 'src/data/projects.json', content: projectsJson },
          { path: 'public/data/projects.json', content: projectsJson },
        ],
        'Update portfolio data via admin panel'
      );

      return NextResponse.json({
        success: true,
        message: 'Data saved to GitHub! Your site will auto-update in ~30 seconds.',
      });
    } else {
      // Local development: write to filesystem
      const srcDataDir = path.join(process.cwd(), 'src', 'data');
      const publicDataDir = path.join(process.cwd(), 'public', 'data');

      await Promise.all([
        writeFile(path.join(srcDataDir, 'profile.json'), profileJson, 'utf-8'),
        writeFile(path.join(publicDataDir, 'profile.json'), profileJson, 'utf-8'),
        writeFile(path.join(srcDataDir, 'publications.json'), publicationsJson, 'utf-8'),
        writeFile(path.join(publicDataDir, 'publications.json'), publicationsJson, 'utf-8'),
        writeFile(path.join(srcDataDir, 'projects.json'), projectsJson, 'utf-8'),
        writeFile(path.join(publicDataDir, 'projects.json'), projectsJson, 'utf-8'),
      ]);

      return NextResponse.json({
        success: true,
        message: 'Data saved successfully!',
      });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to save data';
    console.error('Error saving data:', error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
