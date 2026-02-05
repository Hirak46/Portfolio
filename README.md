# 🎓 Academic Portfolio Website - Complete Guide

> **A modern, responsive academic portfolio with AI-powered content management and cross-browser compatibility**

Built for **Hirak Mondal** - M.Sc. CSE Student, Khulna University

---

## 📋 Table of Contents

- [Quick Start (Run the Project)](#-quick-start-run-the-project)
- [Project Structure](#-project-structure-folder-organization)
- [Features Overview](#-features-overview)
- [Detailed Setup Guide](#-detailed-setup-guide)
- [AI Admin Panel](#-ai-admin-panel)
- [Manual Content Management](#-manual-content-management)
- [Customization Guide](#-customization-guide)
- [Deployment](#-deployment)
- [Browser & Device Compatibility](#-browser--device-compatibility)
- [Tech Stack](#-tech-stack)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Quick Start (Run the Project)

### Prerequisites
- **Node.js** 18+ and **npm** installed
- Code editor (VS Code recommended)
- Modern web browser

### Installation & Running

```powershell
# 1. Navigate to project directory
cd portfullio

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

### Access Points
- **🌐 Main Website**: http://localhost:3000
<!--
- **🔐 Admin Panel**: http://localhost:3000/admin
- **📊 AI Agent**: http://localhost:3000/admin (Password: `hirak2024admin`)
-->


### Quick Build & Deploy
```powershell
# Build for production
npm run build

# Start production server
npm start
```

---

## 📁 Project Structure (Folder Organization)

```
portfullio/
│
├── 📂 src/                          # Source code directory
│   ├── 📂 app/                      # Next.js App Router pages
│   │   ├── 📄 layout.tsx            # Root layout with metadata & theme
│   │   ├── 📄 page.tsx              # Homepage component
│   │   ├── 📄 globals.css           # Global styles & responsive CSS
│   │   └── 📂 api/                  # API routes
│   │       └── 📂 admin/            # Admin API endpoints
│   │           └── 📂 ai-update/    # AI agent for content updates
│   │               └── 📄 route.ts  # AI natural language processor
│   │
│   ├── 📂 components/               # React components
│   │   ├── 📄 Hero.tsx              # Landing section with stats
│   │   ├── 📄 Navigation.tsx        # Top navigation bar
│   │   ├── 📄 Publications.tsx      # Publications list with filters
│   │   ├── 📄 Projects.tsx          # Project showcase grid
│   │   ├── 📄 About.tsx             # About Me section
│   │   ├── 📄 Contact.tsx           # Contact form & info
│   │   ├── 📄 ThemeToggle.tsx       # Dark/Light mode toggle
│   │   ├── 📄 SectionTitle.tsx      # Reusable section headers
│   │   ├── 📄 AnimatedCounter.tsx   # Number animation component
│   │   └── 📂 animations/           # Animation components
│   │       ├── 📄 FadeInWhenVisible.tsx  # Scroll animations
│   │       └── 📄 Parallax.tsx      # Parallax effects
│   │
│   ├── 📂 contexts/                 # React Context providers
│   │   └── 📄 ThemeContext.tsx      # Theme state management
│   │
│   └── 📂 data/                     # JSON data files (IMPORTANT!)
│       ├── 📄 profile.json          # Your personal info, bio, education, skills
│       ├── 📄 publications.json     # All research publications
│       └── 📄 projects.json         # GitHub projects & demos
│
├── 📂 public/                       # Static assets (accessible via URL)
│   ├── 🖼️ Abou.jpg                  # Profile picture for About section
│   ├── 📄 cv.pdf                    # Your CV/Resume for download
│   ├── 📄 CV_INSTRUCTIONS.md        # CV upload guide
│   └── 🎨 [other images]            # Add more images here
│
├── 📂 scripts/                      # Python automation scripts
│   ├── 🐍 fetch_scholar.py          # Auto-fetch Google Scholar publications
│   └── 🐍 verify_setup.py           # Project setup verification
│
├── 📂 .github/                      # GitHub configurations
│   └── 📄 copilot-instructions.md   # AI Copilot setup instructions
│
├── 📂 node_modules/                 # Dependencies (auto-generated, don't edit)
│
├── 📄 package.json                  # Project dependencies & scripts
├── 📄 tsconfig.json                 # TypeScript configuration
├── 📄 tailwind.config.ts            # Tailwind CSS customization
├── 📄 postcss.config.js             # PostCSS & Autoprefixer config
├── 📄 next.config.mjs               # Next.js configuration
├── 📄 next-env.d.ts                 # Next.js TypeScript declarations
│
└── 📚 Documentation Files
    ├── 📄 README.md                 # This file - Complete guide
    ├── 📄 SETUP.md                  # Initial setup instructions
    ├── 📄 GETTING_STARTED.md        # Beginner's guide
    ├── 📄 QUICK_REFERENCE.md        # Quick commands reference
    ├── 📄 PROJECT_STRUCTURE.md      # Detailed structure explanation
    ├── 📄 PROJECT_SUMMARY.md        # Project overview
    ├── 📄 DESIGN_OVERVIEW.md        # Design decisions
    ├── 📄 STATUS_REPORT.md          # Current project status
    ├── 📄 CHECKLIST.md              # Setup checklist
    ├── 📄 COMMANDS.md               # All available commands
    ├── 📄 RESPONSIVE_TESTING_GUIDE.md  # Browser/device testing
    └── 📄 requirements.txt          # Python dependencies
```

---

## 🎯 Features Overview

### ✨ Core Features
- **📱 Fully Responsive**: Works on phones, tablets, laptops, desktops
- **🌓 Dark/Light Theme**: Toggle between themes with smooth transitions
- **🎨 Modern UI**: Glassmorphism effects, gradient text, animations
- **⚡ Fast Performance**: Optimized with Next.js 14 & SSR
- **🔍 SEO Optimized**: Meta tags, Open Graph, structured data
- **♿ Accessible**: WCAG AA compliant, keyboard navigation

### 🧠 AI-Powered Admin Panel
- **Natural Language Updates**: "Add publication about Deep Learning"
- **Smart Pattern Recognition**: Understands various command formats
- **Multi-field Updates**: Change multiple things at once
- **Preview Before Apply**: See changes before saving
- **Intelligent Suggestions**: Context-aware tips
- **Chat History**: Track all your updates

### 📚 Content Sections
1. **Hero Section**: Name, title, tagline, animated stats
2. **Publications**: Filterable by type (journal/conference) and year
3. **Projects**: GitHub projects with technologies and links
4. **About**: Biography, research interests, education, skills
5. **Contact**: Email, social links, contact form

---

## 🛠️ Detailed Setup Guide

### Step 1: Install Node.js
1. Download from https://nodejs.org/ (LTS version)
2. Run installer
3. Verify installation:
   ```powershell
   node --version  # Should show v18.x or higher
   npm --version   # Should show 9.x or higher
   ```

### Step 2: Clone or Download Project
```powershell
# If using Git
git clone <repository-url>
cd portfullio

# Or download ZIP and extract
```

### Step 3: Install Dependencies
```powershell
npm install
```
This installs:
- Next.js 14.2.3
- React 18
- TypeScript
- Tailwind CSS 3.4
- Framer Motion 11
- And all other dependencies

### Step 4: Configure Your Data
Edit these files in `src/data/`:

#### `profile.json` - Your Information
```json
{
  "name": "Your Name",
  "title": "Your Title",
  "email": "your.email@example.com",
  "bio": "Your biography...",
  "education": [...],
  "skills": [...],
  "stats": {
    "publications": 16,
    "citations": 150,
    "hIndex": 8,
    "i10Index": 6
  }
}
```

#### `publications.json` - Your Papers
```json
[
  {
    "id": "pub1",
    "title": "Your Paper Title",
    "authors": "Author1, Author2",
    "venue": "Journal/Conference Name",
    "year": 2024,
    "citations": 10,
    "doi": "10.xxxx/xxxxx",
    "type": "journal"
  }
]
```

#### `projects.json` - Your Projects
```json
[
  {
    "id": "proj1",
    "title": "Project Name",
    "description": "Project description...",
    "technologies": ["Python", "TensorFlow"],
    "github": "https://github.com/...",
    "featured": true
  }
]
```

### Step 5: Add Your Assets
Place files in `public/` folder:
- **Profile photo**: `Abou.jpg` (400x400px recommended)
- **CV/Resume**: `cv.pdf`
- **Other images**: Any additional images

### Step 6: Run Development Server
```powershell
npm run dev
```
Visit http://localhost:3000

---

## 🤖 AI Admin Panel

### Accessing the Admin Panel

1. **Navigate to**: http://localhost:3000/admin
2. **Enter password**: `hirak2024admin`
3. **Start chatting** with the AI agent!

### What the AI Can Do

#### Update Publications
```
"Add publication title: Deep Learning for Medical Imaging, authors: John Smith, Jane Doe, venue: Nature Medicine, year: 2024, citations: 15"

"Update TumorGANet citations to 50"

"Delete publication Early Detection"
```

#### Update Profile Information
```
"Update my bio to say I'm passionate about AI and healthcare"

"Add research interest Quantum Computing"

"Set h-index to 20"
```

#### Manage Skills
```
"Add skills Python, PyTorch, TensorFlow"

"Remove skill MATLAB"
```

#### Update Projects
```
"Add project title: AI Chatbot, description: Intelligent chatbot using GPT, technologies: Python, OpenAI, github: https://github.com/..."
```

#### Recalculate Metrics
```
"Recalculate total citations"

"Update publication count"
```

### AI Commands Reference

| Command Type | Example | Action |
|-------------|---------|--------|
| **Add Publication** | "Add publication title: X, authors: Y" | Creates new publication |
| **Update Publication** | "Update X citations to 50" | Updates existing publication |
| **Delete Publication** | "Delete publication X" | Removes publication |
| **Update Bio** | "Update bio to X" | Changes biography |
| **Add Skills** | "Add skills X, Y, Z" | Adds new skills |
| **Remove Skills** | "Remove skill X" | Deletes skill |
| **Update Metrics** | "Set h-index to 15" | Updates statistics |
| **Add Interest** | "Add research interest X" | Adds research interest |
| **Help** | "help" or "commands" | Shows available commands |

### Preview & Apply System
1. Type your command
2. Click **Preview Changes**
3. Review what will change
4. Click **Apply Changes** to save

---

## ✏️ Manual Content Management

### Editing JSON Files Directly

All website content is stored in `src/data/` folder.

#### Profile Data (`src/data/profile.json`)
```json
{
  "name": "Hirak Mondal",
  "title": "M.Sc. Student in Computer Science and Engineering",
  "email": "hirak.cse.ku@example.com",
  "tagline": "Passionate about AI-driven healthcare...",
  
  "bio": "I am a dedicated researcher...",
  
  "education": [
    {
      "degree": "M.Sc. in Computer Science",
      "institution": "Khulna University",
      "year": "2024-Present"
    }
  ],
  
  "researchInterests": [
    "Medical Image Analysis",
    "Deep Learning"
  ],
  
  "skills": {
    "programming": ["Python", "Java", "C++"],
    "frameworks": ["TensorFlow", "PyTorch"],
    "tools": ["Git", "Docker"]
  },
  
  "stats": {
    "publications": 16,
    "citations": 150,
    "hIndex": 8,
    "i10Index": 6
  },
  
  "social": {
    "github": "https://github.com/...",
    "linkedin": "https://linkedin.com/in/...",
    "scholar": "https://scholar.google.com/..."
  }
}
```

#### Publications Data (`src/data/publications.json`)
Array of publication objects:
```json
[
  {
    "id": "pub1",
    "title": "TumorGANet: A Generative Adversarial Network",
    "authors": "Hirak Mondal, et al.",
    "venue": "Medical Image Analysis",
    "year": 2024,
    "citations": 25,
    "doi": "10.1016/j.media.2024.xxxxx",
    "type": "journal",
    "url": "https://doi.org/..."
  }
]
```

**Publication Types:**
- `journal` - Journal papers
- `conference` - Conference papers
- `book-chapter` - Book chapters

#### Projects Data (`src/data/projects.json`)
Array of project objects:
```json
[
  {
    "id": "proj1",
    "title": "TumorGANet",
    "description": "Deep learning model for tumor detection",
    "technologies": ["Python", "TensorFlow", "Keras"],
    "github": "https://github.com/yourusername/tumorgan",
    "demo": "https://demo-link.com",
    "featured": true
  }
]
```

---

## 🎨 Customization Guide

### Changing Colors & Theme

Edit `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      primary: {
        400: '#60a5fa',  // Light blue
        500: '#3b82f6',  // Blue
        600: '#2563eb',  // Dark blue
      },
    },
  },
}
```

### Modifying Animations

Edit `src/app/globals.css`:
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}
```

### Changing Font

Edit `src/app/layout.tsx`:
```typescript
import { Inter, Roboto } from "next/font/google";

const roboto = Roboto({ 
  weight: ['400', '700'],
  subsets: ["latin"] 
});
```

### Adding New Sections

1. Create component in `src/components/NewSection.tsx`
2. Import in `src/app/page.tsx`
3. Add to navigation in `src/components/Navigation.tsx`

---

## 🚀 Deployment

### Deploy to Vercel (Recommended - Free)

1. **Push to GitHub**
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to https://vercel.com/
   - Sign up with GitHub
   - Click "New Project"
   - Import your repository
   - Click "Deploy"
   - Done! Your site is live!

3. **Custom Domain** (Optional)
   - Vercel Dashboard → Your Project → Settings → Domains
   - Add your custom domain
   - Update DNS records

### Deploy to Netlify

1. Build the project:
   ```powershell
   npm run build
   ```

2. Upload `out/` folder to Netlify

### Environment Variables
If using external APIs, add to Vercel:
```
NEXT_PUBLIC_API_KEY=your_key_here
```

---

## 🌐 Browser & Device Compatibility

### Supported Browsers
✅ Chrome 60+ (Desktop & Mobile)
✅ Firefox 60+ (Desktop & Mobile)
✅ Safari 10+ (macOS & iOS)
✅ Edge 79+ (Chromium-based)
✅ Samsung Internet 8+
✅ Opera Latest

### Supported Devices
✅ **Mobile Phones**: iPhone, Android (320px - 767px)
✅ **Tablets**: iPad, Android tablets (768px - 1023px)
✅ **Laptops**: 13"-15" screens (1024px - 1535px)
✅ **Desktops**: Large monitors (1536px+)

### Responsive Breakpoints
```css
xs:  320px   /* Small phones */
sm:  640px   /* Large phones */
md:  768px   /* Tablets */
lg:  1024px  /* Laptops */
xl:  1280px  /* Large laptops */
2xl: 1536px  /* Desktops */
```

### Testing Responsiveness
1. Open http://localhost:3000
2. Press **F12** (Chrome DevTools)
3. Click device toggle (Ctrl+Shift+M)
4. Select device from dropdown
5. Test different screen sizes

**See `RESPONSIVE_TESTING_GUIDE.md` for detailed testing instructions.**

---

## 💻 Tech Stack

### Frontend Framework
- **Next.js 14.2.3**: React framework with App Router
- **React 18**: UI library with hooks
- **TypeScript**: Type-safe JavaScript

### Styling
- **Tailwind CSS 3.4**: Utility-first CSS framework
- **PostCSS**: CSS transformations & autoprefixer
- **Framer Motion 11**: Animation library

### Features
- **Server Components**: React Server Components
- **API Routes**: Built-in API endpoints
- **Hot Reload**: Instant preview of changes
- **SEO Optimization**: Meta tags & Open Graph

### Development Tools
- **ESLint**: Code linting
- **TypeScript Compiler**: Type checking
- **Node.js 18+**: JavaScript runtime
- **npm**: Package manager

### Python Scripts
- **scholarly**: Google Scholar data fetching
- **requests**: HTTP library
- **beautifulsoup4**: HTML parsing

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. "npm: command not found"
**Solution**: Install Node.js from https://nodejs.org/

#### 2. Port 3000 already in use
```powershell
# Kill process on port 3000
Get-Process -Name node | Stop-Process -Force

# Or use different port
npm run dev -- -p 3001
```

#### 3. Build errors
```powershell
# Clear cache and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

#### 4. Images not loading
- Check file exists in `public/` folder
- Use correct path: `/Abou.jpg` (starts with /)
- File names are case-sensitive

#### 5. Changes not reflecting
- Hard refresh: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
- Clear browser cache
- Restart dev server

#### 6. TypeScript errors
```powershell
# Check types
npm run build
```

#### 7. Styling issues
```powershell
# Rebuild Tailwind
npm run dev
```

---

## 📚 Additional Documentation

- **SETUP.md**: Initial setup guide
- **GETTING_STARTED.md**: Beginner's tutorial
- **PROJECT_STRUCTURE.md**: Detailed folder structure
- **RESPONSIVE_TESTING_GUIDE.md**: Browser/device testing
- **QUICK_REFERENCE.md**: Command cheatsheet
- **DESIGN_OVERVIEW.md**: Design decisions

---

## 🤝 Support & Contact

### Need Help?
1. Check documentation files in project root
2. Review error messages carefully
3. Search for error on Google/Stack Overflow
4. Check Next.js documentation: https://nextjs.org/docs

### Project Information
- **Version**: 1.0.0
- **License**: Private/Personal Use
- **Author**: Hirak Mondal
- **Institution**: Khulna University
- **Department**: Computer Science and Engineering

---

## 📝 Development Workflow

### Daily Development
```powershell
# 1. Start dev server
npm run dev

# 2. Make changes to files

# 3. Test in browser (auto-refreshes)

# 4. Commit changes
git add .
git commit -m "Description of changes"
git push
```

### Adding New Content
1. **Publications**: Edit `src/data/publications.json`
2. **Projects**: Edit `src/data/projects.json`
3. **Profile**: Edit `src/data/profile.json`
4. **Images**: Add to `public/` folder
5. **Save** and refresh browser

### Before Deploying
```powershell
# 1. Build project
npm run build

# 2. Test production build
npm start

# 3. If successful, deploy to Vercel
```

---

## 🎯 Project Goals Achieved

✅ Modern, professional academic portfolio
✅ Fully responsive across all devices
✅ AI-powered content management
✅ Dark/Light theme support
✅ Fast performance & SEO optimized
✅ Easy to customize & maintain
✅ Cross-browser compatible
✅ Accessible & user-friendly
✅ Production-ready & deployable

---

## 📖 Quick Commands Reference

```powershell
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server

# Maintenance
npm install          # Install dependencies
npm update           # Update packages
npm audit fix        # Fix security issues

# Git
git status           # Check changes
git add .            # Stage all changes
git commit -m "msg"  # Commit changes
git push             # Push to GitHub
```

---

**🎉 Your academic portfolio is ready! Visit http://localhost:3000 to see it in action!**

For questions or issues, refer to the documentation files or check the troubleshooting section above.
