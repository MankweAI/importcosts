import pdfplumber
import sys

def verify_pdf(pdf_path):
    try:
        with pdfplumber.open(pdf_path) as pdf:
            if len(pdf.pages) > 0:
                print(f"PDF has {len(pdf.pages)} pages.")
                page = pdf.pages[0]
                text = page.extract_text()
                print("--- Page 1 Text ---")
                print(text[:500])  # Print first 500 chars
                print("--- End Page 1 Text ---")
                
                tables = page.extract_tables()
                print(f"Found {len(tables)} tables on page 1.")
            else:
                print("PDF has no pages.")
    except Exception as e:
        print(f"Error verifying PDF: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python verify_pdf.py <pdf_path>")
        sys.exit(1)
    verify_pdf(sys.argv[1])
