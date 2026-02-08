import json
import re
import sys
from pathlib import Path

def clean_sars_tariff(input_path, output_path):
    """
    Cleans raw SARS table data:
    - Merges multi-line descriptions.
    - Structures columns into a dictionary.
    - Filters out headers/empty lines.
    """
    with open(input_path, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)

    cleaned_data = []
    current_entry = None

    # Regex to identify a valid starting HS code (e.g., "01.01", "0101.21", "0101.21.10")
    # Matches 2 digits + dot + 2 digits, or 4 digits + dot + 1+ digits
    hs_code_pattern = re.compile(r'^(\d{2}\.\d{2}|\d{4}\.\d{1,2})')

    # Column mapping based on observation (verified in previous step)
    # 0: Heading/Subheading
    # 1: CD
    # 2: Description
    # 3: Unit
    # 4: General
    # 5: EU / UK
    # 6: EFTA
    # 7: SADC
    # 8: MERCOSUR
    # 9: AfCFTA

    for row_idx, row in enumerate(raw_data):
        # Skip empty rows (list of empty strings)
        if not any(row):
            continue

        # Skip known header rows
        # Check if first few columns contain known header text
        row_text = "".join(row).lower()
        if "heading" in row_text and "article description" in row_text:
            continue
        if "subheading" in row_text and "unit" in row_text:
            continue
        if "statistical" in row_text and "rate of duty" in row_text:
            continue
        # Skip "Note:" rows if they are just headers (unless we want to capture notes later)
        if row[0].strip().lower().startswith("note:"):
            continue


        # Normalize row length to ensure we can access indices safely
        # Standard table likely has 11 or 12 columns max.
        # 0: Heading
        # 1: CD
        # 2: Desc Indent
        # 3: Desc Text
        # 4: Unit
        # 5: General
        # 6: EU
        # 7: EFTA
        # 8: SADC
        # 9: MERCOSUR
        # 10: AfCFTA
        padded_row = row + [""] * (12 - len(row))

        col_heading = padded_row[0].strip()
        col_cd = padded_row[1].strip()
        
        # Merge columns 2 and 3 for description (handling split indentation)
        part1 = padded_row[2].strip()
        part2 = padded_row[3].strip()
        col_desc = f"{part1} {part2}".strip()
        
        # Check if start of new entry
        is_new_entry = False
        
        if col_heading:
            if hs_code_pattern.match(col_heading):
                if current_entry:
                    cleaned_data.append(current_entry)
                
                current_entry = {
                    "heading": col_heading,
                    "cd": col_cd,
                    "description": col_desc,
                    "unit": padded_row[4].strip(),
                    "rates": {
                        "general": padded_row[5].strip(),
                        "eu_uk": padded_row[6].strip(),
                        "efta": padded_row[7].strip(),
                        "sadc": padded_row[8].strip(),
                        "mercosur": padded_row[9].strip(),
                        "afcfta": padded_row[10].strip()
                    }
                }
                is_new_entry = True
            
            # Use specific check for "0101.2" (4 digit . 1 digit) sometimes headers are weird.
            # But ignoring non-HS code lines (like "CHAPTER 1") for the structured "product" list is usually desired.
            # If we want section headers, we'd add logic here. For now, sticking to products.
            
        else:
            # Empty Heading Column -> Continuation of description?
            # Only if we have an active current_entry and there is description text
            if current_entry and col_desc:
                # Append description
                current_entry["description"] += " " + col_desc

    # Append absolute last entry
    if current_entry:
        cleaned_data.append(current_entry)

    # Final cleanup pass (trimming spaces)
    for entry in cleaned_data:
        entry["description"] = re.sub(r'\s+', ' ', entry["description"]).strip()

    # Save
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(cleaned_data, f, indent=4)
    
    print(f"Cleaned data saved to {output_path} with {len(cleaned_data)} entries.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python clean_sars_tariff.py <input_json> [output_json]")
        # Default for convenience
        input_f = "data/sars_tariff.json"
        output_f = "data/sars_tariff_clean.json"
    else:
        input_f = sys.argv[1]
        output_f = sys.argv[2] if len(sys.argv) > 2 else "data/sars_tariff_clean.json"

    clean_sars_tariff(input_f, output_f)
