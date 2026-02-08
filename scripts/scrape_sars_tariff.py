import pdfplumber
import json
import re
import sys
from pathlib import Path

def scrape_sars_tariff(pdf_path, output_path):
    """
    Scrapes the SARS Tariff Book Schedule 1 Part 1 PDF and extracts data to JSON.
    """
    data = []
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            print(f"Opened {pdf_path} with {len(pdf.pages)} pages.")
            
            for i, page in enumerate(pdf.pages):
                tables = page.extract_tables()
                
                for table in tables:
                    # Logic to identify if it's a valid data table and not a header/footer
                    # This often relies on checking the first row for specific headers
                    # For now, we'll assume a standard structure and refine based on actual output
                    
                    # Heuristic: Check if table has enough columns (usually 4-6 for tariff books)
                    if not table or len(table[0]) < 3: 
                        continue

                    # Process rows
                    # Note: This is a simplified extraction and will likely need 
                    # specific logic for the SARS PDF layout (headers, spanning rows, etc.)
                    for row in table:
                        # Clean row data
                        cleaned_row = [cell.strip() if cell else "" for cell in row]
                        
                        # Basic validation to ensure it's a data row
                        # Check if first column looks like an HS Code (e.g. 0101.21)
                        # or if it's a continuation of the previous description
                        
                        # Placeholder for actual data mapping
                        # We need to map columns to: HS Code, Description, Unit, Rates
                        # This mapping depends heavily on the specific PDF table layout
                        
                        data.append(cleaned_row)
                        
                if i % 10 == 0:
                    print(f"Processed {i+1} pages...")

        # Save to JSON
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4)
            
        print(f"Successfully saved scraped data to {output_path}")

    except Exception as e:
        print(f"Error scraping PDF: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scrape_sars_tariff.py <path_to_pdf> [output_json_path]")
        sys.exit(1)
        
    pdf_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else "data/sars_tariff.json"
    
    # Ensure data directory exists
    Path(output_file).parent.mkdir(parents=True, exist_ok=True)
    
    scrape_sars_tariff(pdf_file, output_file)
