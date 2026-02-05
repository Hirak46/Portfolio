#!/usr/bin/env python3
"""
Google Scholar Publications Fetcher
Automatically fetches publications and citations from Google Scholar
and updates the JSON files for the portfolio website.

Install required packages:
pip install scholarly requests beautifulsoup4

Usage:
python fetch_scholar.py --scholar-id YEANndoAAAAJ

For Hirak Mondal:
python fetch_scholar.py --scholar-id YEANndoAAAAJ
"""

import json
import argparse
from pathlib import Path
from typing import List, Dict, Any, Optional
import sys
import time

try:
    from scholarly import scholarly, ProxyGenerator  # type: ignore
except ImportError:
    print("Error: 'scholarly' package not found.")
    print("Install it with: pip install scholarly")
    sys.exit(1)


def fetch_scholar_profile(scholar_id: str) -> Optional[Dict[str, Any]]:
    """Fetch Google Scholar profile information with retry logic"""
    try:
        print("Setting up proxy for better reliability...")
        # Setup a proxy generator to avoid rate limiting
        pg = ProxyGenerator()  # type: ignore
        # Use Tor or free proxies
        # pg.Tor_Internal(tor_cmd="tor")  # Uncomment if Tor is installed
        pg.FreeProxies()  # type: ignore  # Use free proxies
        scholarly.use_proxy(pg)  # type: ignore
        
        print(f"Searching for author ID: {scholar_id}")
        search_query = scholarly.search_author_id(scholar_id)  # type: ignore
        
        print("Filling author profile...")
        author = scholarly.fill(search_query)  # type: ignore
        
        print(f"✓ Successfully retrieved profile for: {author.get('name', 'Unknown')}")  # type: ignore
        return author  # type: ignore
        
    except Exception as e:
        print(f"Error fetching profile: {e}")
        print("\nTrying without proxy...")
        try:
            # Try without proxy
            search_query = scholarly.search_author_id(scholar_id)  # type: ignore
            author = scholarly.fill(search_query)  # type: ignore
            return author  # type: ignore
        except Exception as e2:
            print(f"Error fetching profile (no proxy): {e2}")
            return None


def parse_publications(author: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Parse publications from scholar profile with better error handling"""
    publications = []
    
    print(f"Found {len(author.get('publications', []))} publications...")
    
    for idx, pub in enumerate(author.get('publications', [])):
        try:
            print(f"\nProcessing publication {idx + 1}...")
            
            # Add delay to avoid rate limiting
            time.sleep(1)
            
            # Fill publication details
            pub_filled = scholarly.fill(pub)  # type: ignore
            
            # Extract publication data
            bib = pub_filled.get('bib', {})  # type: ignore
            title = bib.get('title', 'Untitled')  # type: ignore
            
            # Parse authors - handle both string and list
            authors_raw = bib.get('author', '')  # type: ignore
            if isinstance(authors_raw, str):
                authors = [a.strip() for a in authors_raw.replace(' and ', ',').split(',')]
            else:
                authors = authors_raw if isinstance(authors_raw, list) else [str(authors_raw)]
            
            venue = bib.get('venue', bib.get('journal', 'Unknown'))  # type: ignore
            year = int(bib.get('pub_year', 0)) if bib.get('pub_year') else 0  # type: ignore
            
            # Determine publication type
            venue_lower = str(venue).lower()  # type: ignore
            if any(word in venue_lower for word in ['conference', 'proceedings', 'workshop', 'symposium']):
                pub_type = "conference"
            elif any(word in venue_lower for word in ['chapter', 'book']):
                pub_type = "book-chapter"
            else:
                pub_type = "journal"
            
            pub_data = {
                "id": str(idx + 1),
                "title": str(title),  # type: ignore
                "authors": authors,
                "venue": str(venue),  # type: ignore
                "year": int(year),  # type: ignore
                "citations": int(pub_filled.get('num_citations', 0)),  # type: ignore
                "pdf": str(pub_filled.get('eprint_url', '')),  # type: ignore
                "doi": '',  # scholarly doesn't always provide DOI
                "abstract": str(bib.get('abstract', ''))[:300] if bib.get('abstract') else '',  # type: ignore
                "type": pub_type
            }
            
            publications.append(pub_data)
            print(f"  ✓ Fetched: {str(title)[:60]}...")  # type: ignore
            
        except Exception as e:
            print(f"  ✗ Error parsing publication {idx + 1}: {e}")
            continue
    
    return publications


def update_profile_stats(author: Dict[str, Any], output_dir: Path) -> None:
    """Update profile.json with latest stats"""
    profile_path = output_dir / 'profile.json'
    
    try:
        with open(profile_path, 'r', encoding='utf-8') as f:
            profile_data = json.load(f)
        
        # Update stats
        profile_data['stats'] = {
            'publications': len(author.get('publications', [])),
            'citations': author.get('citedby', 0),
            'hIndex': author.get('hindex', 0),
            'i10Index': author.get('i10index', 0)
        }
        
        # Update name if not set
        if profile_data['name'] == 'Your Name':
            profile_data['name'] = author.get('name', 'Your Name')
        
        with open(profile_path, 'w', encoding='utf-8') as f:
            json.dump(profile_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n✓ Updated profile stats:")
        print(f"  Publications: {profile_data['stats']['publications']}")
        print(f"  Citations: {profile_data['stats']['citations']}")
        print(f"  h-index: {profile_data['stats']['hIndex']}")
        print(f"  i10-index: {profile_data['stats']['i10Index']}")
        
    except Exception as e:
        print(f"✗ Error updating profile: {e}")


def save_publications(publications: List[Dict[str, Any]], output_dir: Path) -> None:
    """Save publications to JSON file"""
    publications_path = output_dir / 'publications.json'
    
    try:
        # Sort by year (descending) and citations
        publications.sort(key=lambda x: (x['year'], x['citations']), reverse=True)
        
        with open(publications_path, 'w', encoding='utf-8') as f:
            json.dump(publications, f, indent=2, ensure_ascii=False)
        
        print(f"\n✓ Saved {len(publications)} publications to {publications_path}")
        
    except Exception as e:
        print(f"✗ Error saving publications: {e}")


def main() -> None:
    parser = argparse.ArgumentParser(description='Fetch Google Scholar publications')
    parser.add_argument(
        '--scholar-id',
        type=str,
        required=True,
        help='Your Google Scholar ID (found in your Scholar profile URL)'
    )
    parser.add_argument(
        '--output-dir',
        type=str,
        default='src/data',
        help='Output directory for JSON files (default: src/data)'
    )
    
    args = parser.parse_args()
    
    output_dir = Path(args.output_dir)
    if not output_dir.exists():
        print(f"✗ Output directory not found: {output_dir}")
        return
    
    print(f"\n🔍 Fetching Google Scholar profile: {args.scholar_id}")
    print("=" * 60)
    
    # Fetch profile
    author = fetch_scholar_profile(args.scholar_id)
    if not author:
        print("✗ Failed to fetch profile")
        return
    
    print(f"✓ Found profile: {author.get('name', 'Unknown')}")
    print(f"\n📚 Fetching publications...")
    print("-" * 60)
    
    # Parse publications
    publications = parse_publications(author)
    
    if publications:
        # Save publications
        save_publications(publications, output_dir)
        
        # Update profile stats
        update_profile_stats(author, output_dir)
        
        print("\n" + "=" * 60)
        print("✅ Successfully updated all data!")
        print("\nNext steps:")
        print("1. Review the updated files in src/data/")
        print("2. Commit changes: git add src/data && git commit -m 'Update publications'")
        print("3. Deploy: git push")
    else:
        print("\n✗ No publications found")


if __name__ == '__main__':
    main()
