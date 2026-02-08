import json
import re
import sys

def find_patterns(file_path):
    print(f"Scanning {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Patterns to look for
    patterns = [
        r"(\d+(\.\d+)?)%\s+or\s+(\d+(\.\d+)?)c/kg",  # X% or Yc/kg
        r"(\d+(\.\d+)?)%\s+plus\s+(\d+(\.\d+)?)c/kg",  # X% plus Yc/kg
        r"with a maximum of",
        r"whichever is the greater",
        r"whichever is the lower",
    ]

    for entry in data:
        rates = entry.get('rates', {})
        # Check all rate columns
        for key, value in rates.items():
            if not value: continue
            
            for pat in patterns:
                if re.search(pat, value, re.IGNORECASE):
                    print(f"MATCH [{key}]: {value} (Heading: {entry['heading']})")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python find_patterns.py <json_file>")
        sys.exit(1)
    
    find_patterns(sys.argv[1])
