import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const instruction = formData.get('instruction') as string;
    const applyChanges = formData.get('applyChanges') === 'true';

    // Get uploaded files
    const files: File[] = [];
    let fileIndex = 0;
    while (formData.has(`file${fileIndex}`)) {
      const file = formData.get(`file${fileIndex}`) as File;
      files.push(file);
      fileIndex++;
    }

    if (!instruction || instruction.trim().length === 0) {
      if (files.length === 0) {
        return NextResponse.json(
          { error: 'Instruction or files are required' },
          { status: 400 }
        );
      }
    }

    // Process the instruction using enhanced AI logic
    const result = await processAIInstruction(instruction, files, applyChanges);

    return NextResponse.json({
      success: true,
      message: applyChanges 
        ? '✅ AI Agent successfully updated your portfolio!' 
        : '📋 Preview generated - changes NOT applied yet',
      changes: result.changes,
      filesModified: result.filesModified,
      filesUploaded: files.length,
      suggestions: result.suggestions,
    });

  } catch (error: any) {
    console.error('AI Update Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process AI instruction' },
      { status: 500 }
    );
  }
}

async function processAIInstruction(instruction: string, files: File[], applyChanges: boolean) {
  const changes: string[] = [];
  const filesModified: string[] = [];
  const suggestions: string[] = [];

  // Get file paths
  const profilePath = path.join(process.cwd(), 'src', 'data', 'profile.json');
  const publicationsPath = path.join(process.cwd(), 'src', 'data', 'publications.json');
  const projectsPath = path.join(process.cwd(), 'src', 'data', 'projects.json');

  // Read current data
  const profileData = JSON.parse(await fs.readFile(profilePath, 'utf-8'));
  const publicationsData = JSON.parse(await fs.readFile(publicationsPath, 'utf-8'));
  const projectsData = JSON.parse(await fs.readFile(projectsPath, 'utf-8'));

  const instructionLower = instruction.toLowerCase();

  // ===== ENHANCED BIO UPDATES =====
  if (instructionLower.includes('bio') || instructionLower.includes('about') || instructionLower.includes('description')) {
    // Complete replacement
    const updateMatch = instruction.match(/(?:update|change|set)\s+(?:my\s+)?bio\s+to\s+["""']?(.+?)["""']?$/is);
    if (updateMatch) {
      const newBio = updateMatch[1].trim().replace(/^["""']|["""']$/g, '');
      profileData.bio = newBio;
      changes.push(`✓ Updated complete bio (${newBio.length} characters)`);
      suggestions.push('💡 Consider adding your research focus or academic achievements');
    }
    
    // Append to bio
    const appendMatch = instruction.match(/add\s+["""']?(.+?)["""']?\s+to\s+(?:my\s+)?bio/is);
    if (appendMatch) {
      const addition = appendMatch[1].trim().replace(/^["""']|["""']$/g, '');
      profileData.bio += ' ' + addition;
      changes.push(`✓ Appended to bio: "${addition.substring(0, 50)}..."`);
    }

    // Replace specific text in bio
    const replaceMatch = instruction.match(/replace\s+["""']?(.+?)["""']?\s+with\s+["""']?(.+?)["""']?\s+in\s+bio/is);
    if (replaceMatch) {
      const oldText = replaceMatch[1].trim().replace(/^["""']|["""']$/g, '');
      const newText = replaceMatch[2].trim().replace(/^["""']|["""']$/g, '');
      if (profileData.bio.includes(oldText)) {
        profileData.bio = profileData.bio.replace(oldText, newText);
        changes.push(`✓ Replaced "${oldText}" with "${newText}" in bio`);
      } else {
        changes.push(`⚠️ Text "${oldText}" not found in bio`);
      }
    }
  }

  // ===== ENHANCED PUBLICATION UPDATES =====
  if (instructionLower.includes('publication') || instructionLower.includes('paper') || instructionLower.includes('citation') || instructionLower.includes('research')) {
    // Update total citations with smart detection
    const totalCitationMatch = instruction.match(/(?:total\s+)?citation(?:s)?\s+(?:count\s+)?(?:is\s+|to\s+|=\s+)?(\d+)/i);
    if (totalCitationMatch) {
      const newCount = parseInt(totalCitationMatch[1]);
      profileData.stats.citations = newCount;
      profileData.scholarStats.totalCitations = newCount;
      changes.push(`✓ Updated total citations to ${newCount}`);
      suggestions.push('💡 Don\'t forget to update individual publication citations too');
    }

    // Add new publication with intelligent field detection
    if (instructionLower.includes('add') && (instructionLower.includes('publication') || instructionLower.includes('paper'))) {
      const titleMatch = instruction.match(/title\s*[:=]?\s*["""']?([^,\n]+?)["""']?(?:\s+(?:in|at|,|author|year)|\s*$)/i);
      const authorsMatch = instruction.match(/author(?:s)?\s*[:=]?\s*["""']?(.+?)["""']?(?:\s+(?:in|venue|year|,)|\s*$)/i);
      const venueMatch = instruction.match(/(?:venue|journal|conference)\s*[:=]?\s*["""']?(.+?)["""']?(?:\s+(?:year|,|author)|\s*$)/i);
      const yearMatch = instruction.match(/year\s*[:=]?\s*(\d{4})/i);
      const citationsMatch = instruction.match(/citation(?:s)?\s*[:=]?\s*(\d+)/i);
      const doiMatch = instruction.match(/doi\s*[:=]?\s*["""']?(10\.\d+\/[^\s"""']+)["""']?/i);
      const typeMatch = instruction.match(/type\s*[:=]?\s*["""']?(journal|conference|book-chapter|preprint)["""']?/i);

      if (titleMatch) {
        const newPub = {
          id: String(publicationsData.length + 1),
          title: titleMatch[1].trim(),
          authors: authorsMatch ? authorsMatch[1].split(/,|and/).map((a: string) => a.trim()) : [profileData.name],
          venue: venueMatch ? venueMatch[1].trim() : "To be specified",
          year: yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear(),
          citations: citationsMatch ? parseInt(citationsMatch[1]) : 0,
          pdf: "",
          doi: doiMatch ? doiMatch[1] : "",
          abstract: "Abstract to be added",
          type: typeMatch ? typeMatch[1] : "journal"
        };
        publicationsData.push(newPub);
        profileData.stats.publications = publicationsData.length;
        changes.push(`✓ Added new publication: "${titleMatch[1].trim()}"`);
        changes.push(`  Authors: ${newPub.authors.join(', ')}`);
        changes.push(`  Venue: ${newPub.venue}`);
        changes.push(`  Year: ${newPub.year}`);
        filesModified.push('publications.json');
        suggestions.push('💡 You can update the abstract, PDF link, and DOI later');
      }
    }

    // Delete/Remove publication
    if (instructionLower.includes('delete') || instructionLower.includes('remove')) {
      const deleteMatch = instruction.match(/(?:delete|remove)\s+(?:publication\s+)?["""']?(.+?)["""']?(?:\s+publication)?(?:\s*$|,)/i);
      if (deleteMatch) {
        const searchTerm = deleteMatch[1].toLowerCase();
        const index = publicationsData.findIndex((p: any) => 
          p.title.toLowerCase().includes(searchTerm) || 
          searchTerm.includes(p.title.toLowerCase().substring(0, 15))
        );
        
        if (index !== -1) {
          const deletedTitle = publicationsData[index].title;
          publicationsData.splice(index, 1);
          profileData.stats.publications = publicationsData.length;
          changes.push(`✓ Deleted publication: "${deletedTitle}"`);
          filesModified.push('publications.json');
        } else {
          changes.push(`⚠️ Publication not found: "${searchTerm}"`);
        }
      }
    }

    // Update specific publication with enhanced search
    const pubUpdateMatch = instruction.match(/update\s+(?:publication\s+)?["""']?(.+?)["""']?\s+(?:citation(?:s)?|to)/i);
    if (pubUpdateMatch) {
      const searchTerm = pubUpdateMatch[1].toLowerCase();
      const citationMatch = instruction.match(/(?:citation(?:s)?|to)\s+(\d+)/i);
      
      const pub = publicationsData.find((p: any) => 
        p.title.toLowerCase().includes(searchTerm) || 
        searchTerm.includes(p.title.toLowerCase().substring(0, 20))
      );
      
      if (pub && citationMatch) {
        pub.citations = parseInt(citationMatch[1]);
        changes.push(`✓ Updated citations for "${pub.title}" to ${citationMatch[1]}`);
        filesModified.push('publications.json');
        
        // Recalculate total citations
        const totalCitations = publicationsData.reduce((sum: number, p: any) => sum + (p.citations || 0), 0);
        profileData.stats.citations = totalCitations;
        profileData.scholarStats.totalCitations = totalCitations;
        changes.push(`✓ Recalculated total citations: ${totalCitations}`);
      }
    }

    // Batch update all publications
    if (instructionLower.includes('recalculate') || instructionLower.includes('sync')) {
      const totalCitations = publicationsData.reduce((sum: number, p: any) => sum + (p.citations || 0), 0);
      profileData.stats.citations = totalCitations;
      profileData.scholarStats.totalCitations = totalCitations;
      changes.push(`✓ Synchronized citation counts: ${totalCitations} total citations`);
    }
  }

  // ===== ENHANCED EMAIL/CONTACT UPDATES =====
  if (instructionLower.includes('email') || instructionLower.includes('e-mail')) {
    const emailMatch = instruction.match(/email\s+(?:to\s+|is\s+|=\s+)?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    if (emailMatch) {
      const oldEmail = profileData.email;
      profileData.email = emailMatch[1];
      changes.push(`✓ Updated email: ${oldEmail} → ${emailMatch[1]}`);
    }
  }

  if (instructionLower.includes('phone') || instructionLower.includes('mobile') || instructionLower.includes('contact number')) {
    const phoneMatch = instruction.match(/(?:phone|mobile|number)\s+(?:to\s+|is\s+|=\s+)?(\+?[\d\s()-]+)/i);
    if (phoneMatch) {
      profileData.phone = phoneMatch[1].trim();
      changes.push(`✓ Updated phone number to ${phoneMatch[1].trim()}`);
    }
  }

  // ===== ENHANCED SKILLS UPDATES =====
  if (instructionLower.includes('skill')) {
    if (instructionLower.includes('add')) {
      const skillMatch = instruction.match(/add\s+(?:skill(?:s)?\s+)?["""']?(.+?)["""']?(?:\s+to\s+(?:my\s+)?skill|$)/is);
      if (skillMatch) {
        const skillsToAdd = skillMatch[1].split(/,|and|;/).map(s => s.trim()).filter(s => s.length > 0);
        
        if (!profileData.skills) profileData.skills = {};
        if (!profileData.skills.programming) profileData.skills.programming = [];
        
        let addedCount = 0;
        skillsToAdd.forEach(skill => {
          if (!profileData.skills.programming.includes(skill)) {
            profileData.skills.programming.push(skill);
            changes.push(`✓ Added skill: ${skill}`);
            addedCount++;
          }
        });
        
        if (addedCount > 0) {
          suggestions.push(`💡 ${skillsToAdd.length - addedCount} skill(s) were already in your profile`);
        }
      }
    }

    if (instructionLower.includes('remove') || instructionLower.includes('delete')) {
      const removeMatch = instruction.match(/(?:remove|delete)\s+(?:skill\s+)?["""']?(.+?)["""']?(?:\s+from\s+skill|$)/is);
      if (removeMatch) {
        const skillsToRemove = removeMatch[1].split(/,|and|;/).map(s => s.trim().toLowerCase());
        
        if (profileData.skills?.programming) {
          const originalLength = profileData.skills.programming.length;
          profileData.skills.programming = profileData.skills.programming.filter(
            (skill: string) => !skillsToRemove.includes(skill.toLowerCase())
          );
          const removed = originalLength - profileData.skills.programming.length;
          if (removed > 0) {
            changes.push(`✓ Removed ${removed} skill(s)`);
          } else {
            changes.push(`⚠️ Skills not found in your profile`);
          }
        }
      }
    }
  }

  // ===== ENHANCED RESEARCH INTERESTS =====
  if (instructionLower.includes('interest') || instructionLower.includes('research area')) {
    if (instructionLower.includes('add')) {
      const interestMatch = instruction.match(/add\s+(?:research\s+)?(?:interest(?:s)?\s+)?["""']?(.+?)["""']?(?:\s+to|as|$)/is);
      if (interestMatch) {
        const interests = interestMatch[1].split(/,|and|;/).map(s => s.trim()).filter(s => s.length > 0);
        let addedCount = 0;
        interests.forEach(interest => {
          if (!profileData.interests.includes(interest)) {
            profileData.interests.push(interest);
            changes.push(`✓ Added research interest: ${interest}`);
            addedCount++;
          }
        });
        if (interests.length - addedCount > 0) {
          suggestions.push(`💡 ${interests.length - addedCount} interest(s) already existed`);
        }
      }
    }

    if (instructionLower.includes('remove') || instructionLower.includes('delete')) {
      const removeMatch = instruction.match(/(?:remove|delete)\s+(?:research\s+)?(?:interest\s+)?["""']?(.+?)["""']?(?:\s+from|$)/is);
      if (removeMatch) {
        const toRemove = removeMatch[1].split(/,|and|;/).map(s => s.trim().toLowerCase());
        const originalLength = profileData.interests.length;
        profileData.interests = profileData.interests.filter(
          (interest: string) => !toRemove.includes(interest.toLowerCase())
        );
        const removed = originalLength - profileData.interests.length;
        if (removed > 0) {
          changes.push(`✓ Removed ${removed} research interest(s)`);
        }
      }
    }
  }

  // ===== TITLE/TAGLINE/NAME UPDATES =====
  if (instructionLower.includes('name') && !instructionLower.includes('filename') && !instructionLower.includes('username')) {
    const nameMatch = instruction.match(/(?:my\s+)?name\s+(?:to\s+|is\s+)?["""']?(.+?)["""']?$/i);
    if (nameMatch) {
      const oldName = profileData.name;
      profileData.name = nameMatch[1].trim();
      changes.push(`✓ Updated name: ${oldName} → ${nameMatch[1].trim()}`);
    }
  }

  if ((instructionLower.includes('title') || instructionLower.includes('position')) && !instructionLower.includes('publication')) {
    const titleMatch = instruction.match(/(?:title|position)\s+(?:to\s+|is\s+)?["""']?(.+?)["""']?$/is);
    if (titleMatch) {
      profileData.title = titleMatch[1].trim().replace(/^["""']|["""']$/g, '');
      changes.push(`✓ Updated professional title to "${profileData.title}"`);
    }
  }

  if (instructionLower.includes('tagline') || instructionLower.includes('motto') || instructionLower.includes('headline')) {
    const taglineMatch = instruction.match(/(?:tagline|motto|headline)\s+(?:to\s+|is\s+)?["""']?(.+?)["""']?$/is);
    if (taglineMatch) {
      profileData.tagline = taglineMatch[1].trim().replace(/^["""']|["""']$/g, '');
      changes.push(`✓ Updated tagline to "${profileData.tagline}"`);
    }
  }

  // ===== ENHANCED PROJECT UPDATES =====
  if (instructionLower.includes('project')) {
    if (instructionLower.includes('add')) {
      const titleMatch = instruction.match(/(?:add\s+project\s+|project\s+title\s*[:=]\s*)["""']?(.+?)["""']?(?:\s+|,|$)/i);
      const descMatch = instruction.match(/description\s*[:=]\s*["""']?(.+?)["""']?(?:\s+(?:tech|github|demo)|$)/is);
      const techMatch = instruction.match(/(?:technolog(?:y|ies)|tech|stack)\s*[:=]\s*["""']?(.+?)["""']?(?:\s+(?:github|demo|description)|$)/is);
      const githubMatch = instruction.match(/github\s*[:=]\s*["""']?(.+?)["""']?(?:\s+|$)/i);
      
      if (titleMatch) {
        const newProject = {
          id: projectsData.length + 1,
          title: titleMatch[1].trim(),
          description: descMatch ? descMatch[1].trim() : "Description to be added",
          technologies: techMatch ? techMatch[1].split(/,|and/).map((t: string) => t.trim()) : [],
          github: githubMatch ? githubMatch[1].trim() : "",
          demo: "",
          image: "/projects/default.jpg"
        };
        projectsData.push(newProject);
        changes.push(`✓ Added new project: "${newProject.title}"`);
        if (newProject.description !== "Description to be added") {
          changes.push(`  Description: ${newProject.description.substring(0, 60)}...`);
        }
        if (newProject.technologies.length > 0) {
          changes.push(`  Technologies: ${newProject.technologies.join(', ')}`);
        }
        filesModified.push('projects.json');
        suggestions.push('💡 You can add GitHub and demo links later');
      }
    }

    if (instructionLower.includes('delete') || instructionLower.includes('remove')) {
      const deleteMatch = instruction.match(/(?:delete|remove)\s+(?:project\s+)?["""']?(.+?)["""']?(?:\s+project)?/i);
      if (deleteMatch) {
        const searchTerm = deleteMatch[1].toLowerCase();
        const index = projectsData.findIndex((p: any) => 
          p.title.toLowerCase().includes(searchTerm)
        );
        
        if (index !== -1) {
          const deletedTitle = projectsData[index].title;
          projectsData.splice(index, 1);
          changes.push(`✓ Deleted project: "${deletedTitle}"`);
          filesModified.push('projects.json');
        } else {
          changes.push(`⚠️ Project not found: "${searchTerm}"`);
        }
      }
    }
  }

  // ===== H-INDEX / I10-INDEX / METRICS UPDATES =====
  if (instructionLower.includes('h-index') || instructionLower.includes('hindex') || instructionLower.includes('h index')) {
    const hIndexMatch = instruction.match(/h-?\s*index\s+(?:is\s+|to\s+|=\s+)?(\d+)/i);
    if (hIndexMatch) {
      const newHIndex = parseInt(hIndexMatch[1]);
      profileData.stats.hIndex = newHIndex;
      profileData.scholarStats.hIndex = newHIndex;
      changes.push(`✓ Updated h-index to ${newHIndex}`);
    }
  }

  if (instructionLower.includes('i10') || instructionLower.includes('i-10') || instructionLower.includes('i 10')) {
    const i10Match = instruction.match(/i-?\s*10(?:\s+index)?\s+(?:is\s+|to\s+|=\s+)?(\d+)/i);
    if (i10Match) {
      const newI10 = parseInt(i10Match[1]);
      profileData.stats.i10Index = newI10;
      profileData.scholarStats.i10Index = newI10;
      changes.push(`✓ Updated i10-index to ${newI10}`);
    }
  }

  // ===== EDUCATION UPDATES =====
  if (instructionLower.includes('education') || instructionLower.includes('degree')) {
    if (instructionLower.includes('add')) {
      const degreeMatch = instruction.match(/degree\s*[:=]\s*["""']?(.+?)["""']?(?:\s+|,)/i);
      const institutionMatch = instruction.match(/(?:institution|university|college)\s*[:=]\s*["""']?(.+?)["""']?(?:\s+|,|$)/i);
      const yearMatch = instruction.match(/year\s*[:=]\s*["""']?(.+?)["""']?(?:\s+|$)/i);
      
      if (degreeMatch && institutionMatch) {
        const newEducation = {
          degree: degreeMatch[1].trim(),
          institution: institutionMatch[1].trim(),
          year: yearMatch ? yearMatch[1].trim() : "Present",
          description: "Details to be added"
        };
        
        if (!profileData.education) profileData.education = [];
        profileData.education.push(newEducation);
        changes.push(`✓ Added education: ${newEducation.degree} from ${newEducation.institution}`);
      }
    }
  }

  // ===== SOCIAL LINKS UPDATES =====
  if (instructionLower.includes('social') || instructionLower.includes('linkedin') || instructionLower.includes('github') || instructionLower.includes('scholar')) {
    const linkedinMatch = instruction.match(/linkedin\s+(?:to\s+|is\s+|=\s+)?["""']?(https?:\/\/[^\s"""']+)["""']?/i);
    if (linkedinMatch) {
      if (!profileData.social) profileData.social = {};
      profileData.social.linkedin = linkedinMatch[1];
      changes.push(`✓ Updated LinkedIn URL`);
    }

    const githubMatch = instruction.match(/github\s+(?:to\s+|is\s+|=\s+)?["""']?(https?:\/\/[^\s"""']+)["""']?/i);
    if (githubMatch) {
      if (!profileData.social) profileData.social = {};
      profileData.social.github = githubMatch[1];
      changes.push(`✓ Updated GitHub URL`);
    }

    const scholarMatch = instruction.match(/(?:scholar|google scholar)\s+(?:to\s+|is\s+|=\s+)?["""']?(https?:\/\/[^\s"""']+)["""']?/i);
    if (scholarMatch) {
      if (!profileData.social) profileData.social = {};
      profileData.social.scholar = scholarMatch[1];
      changes.push(`✓ Updated Google Scholar URL`);
    }
  }

  // ===== SAVE AND FINALIZE =====
  // Save updated data
  if (changes.length > 0 && applyChanges) {
    await fs.writeFile(profilePath, JSON.stringify(profileData, null, 2));
    filesModified.push('profile.json');
    
    if (filesModified.includes('publications.json')) {
      await fs.writeFile(publicationsPath, JSON.stringify(publicationsData, null, 2));
    }
    
    if (filesModified.includes('projects.json')) {
      await fs.writeFile(projectsPath, JSON.stringify(projectsData, null, 2));
    }
  }

  // ===== INTELLIGENT HELP SYSTEM =====
  if (changes.length === 0) {
    changes.push('🤔 I couldn\'t understand that instruction. Here are some examples:');
    changes.push('');
    changes.push('📝 **Profile Updates:**');
    changes.push('- "Update my bio to mention I\'m an AI researcher at XYZ University"');
    changes.push('- "Change my name to Dr. John Doe"');
    changes.push('- "Set my title to Assistant Professor"');
    changes.push('- "Update my email to new.email@university.edu"');
    changes.push('');
    changes.push('🎓 **Publications:**');
    changes.push('- "Add publication title: Deep Learning for Medical Imaging, authors: John, Jane, venue: Nature, year: 2024, citations: 10"');
    changes.push('- "Update TumorGANet citations to 50"');
    changes.push('- "Delete publication Early Detection"');
    changes.push('- "Set total citations to 100"');
    changes.push('');
    changes.push('🔬 **Research & Skills:**');
    changes.push('- "Add Machine Learning, Deep Learning to my interests"');
    changes.push('- "Add skill Python, PyTorch, TensorFlow"');
    changes.push('- "Remove skill Java"');
    changes.push('');
    changes.push('💻 **Projects:**');
    changes.push('- "Add project title: AI Chatbot, description: Smart chatbot using GPT, tech: Python, React"');
    changes.push('- "Delete project Portfolio Website"');
    changes.push('');
    changes.push('📊 **Metrics:**');
    changes.push('- "Set h-index to 5"');
    changes.push('- "Update i10-index to 3"');
    changes.push('- "Recalculate total citations"');
    changes.push('');
    changes.push('🔗 **Social Links:**');
    changes.push('- "Update LinkedIn to https://linkedin.com/in/yourprofile"');
    changes.push('- "Set GitHub to https://github.com/yourusername"');
  }

  // Add file upload information
  if (files.length > 0) {
    changes.push('');
    changes.push(`📎 **Files Received:** ${files.length} file(s)`);
    files.forEach(file => {
      changes.push(`  • ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    });
    suggestions.push('💡 File processing capability coming soon - currently analyzing text instructions only');
  }

  // Add mode indicator
  if (!applyChanges && changes.length > 0 && !changes[0].includes('couldn\'t understand')) {
    changes.push('');
    changes.push('⚠️ **PREVIEW MODE**: Changes shown above are NOT applied yet.');
    changes.push('Click "✅ Apply Changes Now" to save these changes to your portfolio.');
  }

  // Add helpful suggestions
  if (suggestions.length > 0) {
    changes.push('');
    changes.push('💡 **Suggestions:**');
    suggestions.forEach(s => changes.push(s));
  }

  return {
    changes: changes.join('\n'),
    filesModified: Array.from(new Set(filesModified)),
    suggestions,
  };
}
