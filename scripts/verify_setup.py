#!/usr/bin/env python3
"""
Setup Verification Script
Checks if all required files and configurations are in place.
"""

import json
from pathlib import Path

def check_file_exists(file_path: Path, name: str) -> bool:
    """Check if a file exists"""
    if file_path.exists():
        print(f"✓ {name} exists")
        return True
    else:
        print(f"✗ {name} missing - {file_path}")
        return False

def check_json_valid(file_path: Path, name: str) -> bool:
    """Check if JSON file is valid"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            json.load(f)
        print(f"✓ {name} is valid JSON")
        return True
    except Exception as e:
        print(f"✗ {name} has invalid JSON: {e}")
        return False

def main():
    print("🔍 Academic Portfolio - Setup Verification")
    print("=" * 60)
    
    project_root = Path(__file__).parent.parent
    all_good = True
    
    # Check critical files
    print("\n📁 Checking project files...")
    files_to_check = [
        (project_root / "package.json", "package.json"),
        (project_root / "tsconfig.json", "tsconfig.json"),
        (project_root / "tailwind.config.ts", "tailwind.config.ts"),
        (project_root / "next.config.mjs", "next.config.mjs"),
        (project_root / "src" / "app" / "page.tsx", "src/app/page.tsx"),
        (project_root / "src" / "app" / "layout.tsx", "src/app/layout.tsx"),
    ]
    
    for file_path, name in files_to_check:
        if not check_file_exists(file_path, name):
            all_good = False
    
    # Check data files
    print("\n📊 Checking data files...")
    data_files = [
        (project_root / "src" / "data" / "profile.json", "Profile data"),
        (project_root / "src" / "data" / "publications.json", "Publications data"),
        (project_root / "src" / "data" / "projects.json", "Projects data"),
    ]
    
    for file_path, name in data_files:
        if check_file_exists(file_path, name):
            if not check_json_valid(file_path, name):
                all_good = False
        else:
            all_good = False
    
    # Check components
    print("\n🧩 Checking components...")
    components = [
        "Hero.tsx", "Publications.tsx", "Projects.tsx", 
        "About.tsx", "Contact.tsx", "Navigation.tsx", "ThemeToggle.tsx"
    ]
    
    for component in components:
        path = project_root / "src" / "components" / component
        if not check_file_exists(path, f"components/{component}"):
            all_good = False
    
    # Check for profile photo
    print("\n📸 Checking assets...")
    profile_photo = project_root / "public" / "profile.jpg"
    if not profile_photo.exists():
        print("⚠ Profile photo missing - add your photo as public/profile.jpg")
        print("  (This is optional but recommended)")
    else:
        print("✓ Profile photo exists")
    
    # Check if data needs customization
    print("\n⚙️ Checking customization...")
    profile_path = project_root / "src" / "data" / "profile.json"
    if profile_path.exists():
        with open(profile_path, 'r', encoding='utf-8') as f:
            profile = json.load(f)
            if profile.get('name') == 'Your Name':
                print("⚠ Profile not customized - edit src/data/profile.json")
            else:
                print(f"✓ Profile customized for: {profile.get('name')}")
    
    # Summary
    print("\n" + "=" * 60)
    if all_good:
        print("✅ All critical files are in place!")
        print("\nNext steps:")
        print("1. Install Node.js if not already installed")
        print("2. Run: npm install")
        print("3. Customize src/data/ files")
        print("4. Run: npm run dev")
    else:
        print("⚠️  Some files are missing or invalid")
        print("Please check the errors above")
    
    print("=" * 60)

if __name__ == '__main__':
    main()
