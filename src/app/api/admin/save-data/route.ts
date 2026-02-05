import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { profile, publications, projects } = await request.json();

    const srcDataDir = path.join(process.cwd(), 'src', 'data');
    const publicDataDir = path.join(process.cwd(), 'public', 'data');

    // Save to both src/data and public/data directories
    const profileData = JSON.stringify(profile, null, 2);
    const publicationsData = JSON.stringify(publications, null, 2);
    const projectsData = JSON.stringify(projects, null, 2);

    // Save profile data
    await Promise.all([
      writeFile(path.join(srcDataDir, 'profile.json'), profileData, 'utf-8'),
      writeFile(path.join(publicDataDir, 'profile.json'), profileData, 'utf-8'),
    ]);

    // Save publications data
    await Promise.all([
      writeFile(path.join(srcDataDir, 'publications.json'), publicationsData, 'utf-8'),
      writeFile(path.join(publicDataDir, 'publications.json'), publicationsData, 'utf-8'),
    ]);

    // Save projects data
    await Promise.all([
      writeFile(path.join(srcDataDir, 'projects.json'), projectsData, 'utf-8'),
      writeFile(path.join(publicDataDir, 'projects.json'), projectsData, 'utf-8'),
    ]);

    return NextResponse.json({ 
      success: true, 
      message: 'Data saved successfully' 
    });
  } catch (error) {
    console.error('Error saving data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save data' },
      { status: 500 }
    );
  }
}
