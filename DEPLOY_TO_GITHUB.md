# 🚀 Deploy Your Portfolio to GitHub

## Step 1: Install Git

Download and install Git from: **https://git-scm.com/download/win**

After installation, **restart VS Code** or your terminal.

---

## Step 2: Configure Git (First Time Only)

Open PowerShell and run:

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## Step 3: Push to GitHub

Run these commands **one by one** in PowerShell:

```powershell
# Navigate to your project folder
cd C:\Users\CSE-AI-Lab-04\Desktop\Hirak\portfullio

# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit - Academic Portfolio"

# Add your GitHub repository
git remote add origin https://github.com/Hirak46/Portfolio.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

**Note:** You may need to authenticate with GitHub. Options:
- Use GitHub Desktop (easier): https://desktop.github.com/
- Use Personal Access Token: https://github.com/settings/tokens

---

## Step 4: Deploy to Vercel (Free Hosting)

1. Go to **https://vercel.com/**
2. Click **"Sign Up"** and use your GitHub account
3. Click **"Add New Project"**
4. Select your repository: **Hirak46/Portfolio**
5. Click **"Deploy"** (keep all default settings)

✅ **Done!** Your site will be live at: `https://portfolio-xxxx.vercel.app`

---

## 🔐 Admin Panel Access

After deployment, access your admin panel at:

```
https://your-site.vercel.app/admin
```

**Default Password:** `hirak2024admin`

---

## 📝 Update Your Portfolio Later

To update your portfolio:

```powershell
# Make your changes to files, then:
git add .
git commit -m "Update portfolio content"
git push
```

Vercel will automatically redeploy your site! 🎉

---

## Alternative: Use GitHub Desktop (Easier)

If you prefer a GUI instead of commands:

1. Download **GitHub Desktop**: https://desktop.github.com/
2. Open it and sign in with your GitHub account
3. Click **"Add"** → **"Add Existing Repository"**
4. Select your folder: `C:\Users\CSE-AI-Lab-04\Desktop\Hirak\portfullio`
5. Click **"Publish repository"** to GitHub
6. Then deploy to Vercel as described above

---

## ✅ Your Portfolio is Ready!

All code is working perfectly. Just push to GitHub and deploy to Vercel!
