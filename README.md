# 🎓 Academic Portfolio — Hirak Mondal

> A modern, responsive academic portfolio built with Next.js 14, TypeScript, Tailwind CSS & Framer Motion.  
> Deployed on **Vercel** with AI-powered admin panel and Google Scholar integration.

**Live**: [hirak.vercel.app](https://hirak.vercel.app)

---

## Quick Start

```powershell
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

- **Website**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin (Password: `hirak2024admin`)

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout, metadata, theme
│   ├── page.tsx            # Homepage
│   ├── globals.css         # Global styles
│   ├── admin/              # Admin panel pages
│   └── api/admin/          # API routes (save, get, upload, AI, etc.)
├── components/
│   ├── Hero.tsx            # Landing section with stats
│   ├── Navigation.tsx      # Top navigation bar
│   ├── Publications.tsx    # Filterable publications list
│   ├── Projects.tsx        # Project showcase grid
│   ├── About.tsx           # Biography, education, skills
│   ├── Experience.tsx      # Work, awards, memberships
│   ├── Contact.tsx         # Contact form & social links
│   ├── AnimatedCounter.tsx # Number animation
│   ├── SectionTitle.tsx    # Reusable section headers
│   ├── ThemeToggle.tsx     # Dark/Light toggle
│   └── animations/         # FadeInWhenVisible, Parallax
├── contexts/
│   └── ThemeContext.tsx     # Theme state management
├── data/
│   ├── profile.json        # Your info, bio, education, stats
│   ├── publications.json   # Research publications
│   └── projects.json       # GitHub projects
└── lib/
    └── github.ts           # GitHub API helper (Vercel production saves)

public/
├── Hirak.jpg               # Hero profile photo
├── Abou.jpg                # About section photo
├── cv/Hirak.pdf            # Downloadable CV
└── data/                   # Public copy of JSON data

scripts/
├── fetch_scholar.py        # Auto-fetch Google Scholar publications
└── verify_setup.py         # Project setup verification
```

---

## Customize Your Data

Edit JSON files in `src/data/`:

| File                | Content                                                     |
| ------------------- | ----------------------------------------------------------- |
| `profile.json`      | Name, title, bio, education, skills, stats, social links    |
| `publications.json` | Research papers (type: journal / conference / book-chapter) |
| `projects.json`     | GitHub projects, technologies, descriptions                 |

Add your photos to `public/` and your CV to `public/cv/`.

---

## AI Admin Panel

Access at `/admin` → type natural language commands:

```
"Add publication title: Deep Learning for X, authors: A, B, venue: IEEE, year: 2025"
"Update TumorGANet citations to 60"
"Set h-index to 5"
"Add skill PyTorch"
"Update bio to ..."
```

Preview changes before applying. All saves go through GitHub API on Vercel (triggers auto-redeploy).

---

## Deploy to Vercel

1. Push to GitHub:

   ```powershell
   git add .
   git commit -m "Update portfolio"
   git push origin main
   ```

2. Go to [vercel.com](https://vercel.com) → Import your repo → Deploy

3. Set environment variables in Vercel dashboard (Settings → Environment Variables):

   | Variable       | Value                                                                   |
   | -------------- | ----------------------------------------------------------------------- |
   | `GITHUB_TOKEN` | Your [GitHub PAT](https://github.com/settings/tokens) with `repo` scope |
   | `GITHUB_OWNER` | `Hirak46`                                                               |
   | `GITHUB_REPO`  | `Portfolio`                                                             |

4. Vercel auto-deploys on every push to `main`.

---

## Google Scholar Auto-Update

```powershell
pip install scholarly requests beautifulsoup4
python scripts/fetch_scholar.py --scholar-id YOUR_SCHOLAR_ID
```

---

## Tech Stack

| Category   | Technologies                                              |
| ---------- | --------------------------------------------------------- |
| Framework  | Next.js 14, React 18, TypeScript                          |
| Styling    | Tailwind CSS 3.4, Framer Motion 11                        |
| Deployment | Vercel (auto-deploy from GitHub)                          |
| Admin      | AI-powered natural language content management            |
| Data       | GitHub API for production saves, local filesystem for dev |

---

## Troubleshooting

| Problem            | Solution                                                 |
| ------------------ | -------------------------------------------------------- |
| Port 3000 in use   | `npx kill-port 3000` or use `npm run dev -- -p 3001`     |
| Build errors       | Delete `node_modules` & `.next`, run `npm install` again |
| Images not loading | Check file exists in `public/`, path starts with `/`     |
| Admin not saving   | Verify `GITHUB_TOKEN` env var is set on Vercel           |

---

**Author**: Hirak Mondal — M.Sc. CSE, Khulna University  
**License**: Private/Personal Use
