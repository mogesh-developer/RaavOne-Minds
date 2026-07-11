import fitz
from pathlib import Path

class PDFService:
    @staticmethod
    def extract_text(file_path: str):
        document=fitz.open(file_path)
        pages=[]
        for page_number, page in enumerate(document, start=1):
            text = page.get_text()
            pages.append({
                "page": page_number,
                "text": text
            })
        document.close()
        return pages
