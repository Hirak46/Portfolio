import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
const pdfParse = require('pdf-parse');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('cv') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse PDF
    let cvText = '';
    if (file.type === 'application/pdf') {
      const pdfData = await pdfParse(buffer);
      cvText = pdfData.text;
    } else {
      // For LaTeX files
      cvText = buffer.toString('utf-8');
    }

    // Extract information using regex patterns
    const extractedData = extractCVData(cvText);

    // Update profile.json
    const profilePath = join(process.cwd(), 'src', 'data', 'profile.json');
    const currentProfile = JSON.parse(await readFile(profilePath, 'utf-8'));

    // Merge extracted data with current profile
    const updatedProfile = {
      ...currentProfile,
      ...extractedData,
      skills: extractedData.skills || currentProfile.skills,
      certifications: extractedData.certifications || currentProfile.certifications,
      volunteer: extractedData.volunteer || currentProfile.volunteer,
      awards: extractedData.awards || currentProfile.awards,
      memberships: extractedData.memberships || currentProfile.memberships,
      reviewExperience: extractedData.reviewExperience || currentProfile.reviewExperience,
    };

    // Save updated profile
    await writeFile(profilePath, JSON.stringify(updatedProfile, null, 2));

    return NextResponse.json({
      success: true,
      message: 'CV processed successfully',
      extractedData,
    });
  } catch (error) {
    console.error('Error parsing CV:', error);
    return NextResponse.json(
      { error: 'Failed to process CV', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function extractCVData(text: string): any {
  const data: any = {};

  // Extract email
  const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
  if (emailMatch) {
    data.email = emailMatch[1];
  }

  // Extract phone
  const phoneMatch = text.match(/(\+?\d{10,15})/);
  if (phoneMatch) {
    data.phone = phoneMatch[1];
  }

  // Extract name (usually appears early in CV)
  const lines = text.split('\n');
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].trim();
    if (line.length > 3 && line.length < 50 && /^[A-Z]/.test(line)) {
      if (!line.includes('@') && !line.includes('http')) {
        data.name = line;
        break;
      }
    }
  }

  // Extract certifications
  if (text.includes('CERTIFICATION') || text.includes('Certificate')) {
    const certSection = text.match(/CERTIFICATION[S]?[\s\S]*?(?=\n\n[A-Z]{3,}|$)/i);
    if (certSection) {
      const certs = certSection[0].match(/•\s*(.+?)(?=\n|$)/g);
      if (certs) {
        data.certifications = certs.map(c => c.replace('•', '').trim());
      }
    }
  }

  // Extract skills
  if (text.includes('SKILL')) {
    data.skills = {};
    
    const programmingMatch = text.match(/Programming[:\s]+(.+?)(?=\n[A-Z]|$)/i);
    if (programmingMatch) {
      data.skills.programming = programmingMatch[1].split(',').map(s => s.trim());
    }

    const languagesMatch = text.match(/Languages[:\s]+(.+?)(?=\n[A-Z]|$)/i);
    if (languagesMatch) {
      data.skills.languages = languagesMatch[1].split(',').map(s => s.trim());
    }
  }

  // Extract volunteer experience
  if (text.includes('VOLUNTEER')) {
    const volSection = text.match(/VOLUNTEER[S\s\w]*?[\s\S]*?(?=\n\n[A-Z]{3,}|$)/i);
    if (volSection) {
      const vols = volSection[0].match(/•\s*(.+?)(?=\n|$)/g);
      if (vols) {
        data.volunteer = vols.map(v => v.replace('•', '').trim());
      }
    }
  }

  return data;
}
