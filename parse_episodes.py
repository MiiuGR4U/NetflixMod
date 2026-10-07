import re
import json

file_path = r"C:\Users\Admin\.gemini\antigravity-ide\brain\5c65b414-7bb7-4692-a2a0-a2f2eb87ce32\.system_generated\steps\17\content.md"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# The episodes are likely formatted like "001 - Name", "002 - Name", or "Episódio 001 - Name"
# Let's try to extract them with regex.
# I'll look for lines containing numbers followed by some separator.
# Actually, it's HTML, so maybe list items <li> or <div>.

# Let's just find anything like: >\s*\d+\s*-\s*(.*?)</
# Or just use BeautifulSoup
try:
    from bs4 import BeautifulSoup
except ImportError:
    import os
    os.system("pip install beautifulsoup4")
    from bs4 import BeautifulSoup

soup = BeautifulSoup(content, 'html.parser')
text = soup.get_text()

episodes = {}
# Common pattern: "1 - I'm Luffy! The Man Who's Gonna Be King of the Pirates!"
# Or "Episódio 01 - ..."
matches = re.findall(r'(?:Epis[oó]dio\s+)?(\d+)\s*[-–]\s*(.*?)(?=\n|$)', text, re.IGNORECASE)

if not matches:
    # Let's try another regex
    print("No matches with first regex. Trying second...")
    matches = re.findall(r'(\d+)\s*[-–]\s*(.*?)(?=\n|<)', content)

for match in matches:
    ep_num = int(match[0])
    title = match[1].strip()
    if title and not title.startswith("(") and len(title) > 2:
        episodes[ep_num] = title

print(f"Found {len(episodes)} episodes.")

with open(r"d:\Programming\TAMPERMONKEY\episodes.json", "w", encoding="utf-8") as f:
    json.dump(episodes, f, ensure_ascii=False, indent=2)

print("Saved to episodes.json")
