# Academic Portfolio Project Setup

## Project Setup Progress

- [x] Verify that the copilot-instructions.md file in the .github directory is created.
- [x] Clarify Project Requirements
- [x] Scaffold the Project
- [x] Customize the Project
- [x] Install Required Extensions
- [ ] Compile the Project (requires Node.js installation)
- [ ] Create and Run Task
- [ ] Launch the Project
- [x] Ensure Documentation is Complete

## Project Type
Next.js 14 TypeScript Academic Portfolio with:
- Auto-updating Google Scholar integration
- Tailwind CSS for styling
- Framer Motion for animations
- Dark/Light theme toggle
- Sections: Home, Publications, Projects, About, Contact

## ✅ Completed
All project files have been created successfully! The portfolio includes:
- ✅ Complete Next.js 14 setup with TypeScript
- ✅ Tailwind CSS with custom dark theme
- ✅ Framer Motion animations throughout
- ✅ All sections: Hero, Publications, Projects, About, Contact
- ✅ Dark/Light theme toggle
- ✅ Python script for Google Scholar automation
- ✅ GitHub Actions workflow for auto-updates
- ✅ Comprehensive documentation

## ⚠️ Next Steps - IMPORTANT

### 1. Install Node.js (REQUIRED)
Node.js is not installed on this system. You must install it to run the project:
- Download from: https://nodejs.org/
- Install the LTS version
- Restart VS Code after installation
- Verify: Run `node --version` in terminal

### 2. Install Dependencies
After installing Node.js:
```powershell
npm install
```

### 3. Customize Your Data
Edit these files with your information:
- `src/data/profile.json` - Your profile, social links, education
- `src/data/publications.json` - Your publications (or use the Python script)
- `src/data/projects.json` - Your research projects
- Add your photo to `public/profile.jpg`

### 4. Run Development Server
```powershell
npm run dev
```
Then visit: http://localhost:3000

### 5. Google Scholar Auto-Update
```powershell
# Install Python packages
pip install scholarly requests beautifulsoup4

# Fetch your publications (replace with your Scholar ID)
python scripts/fetch_scholar.py --scholar-id YOUR_SCHOLAR_ID
```

### 6. Deploy to Vercel (Free)
1. Push to GitHub
2. Visit https://vercel.com/
3. Import your repository
4. Deploy!

## 📖 Documentation
- See `README.md` for full setup and deployment guide
