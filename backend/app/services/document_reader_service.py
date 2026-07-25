import os
from pathlib import Path
from pypdf import PdfReader
import docx
from app.services.ocr_service import ocrService

class DocumentReaderService:
    @classmethod
    async def extract_text_by_pages(cls, file_path: str) -> list[dict]:
        """
        Extracts text from files (.pdf, .docx, .txt, .md, .png, .jpg, .jpeg).
        Returns a list of dicts: [{"page": page_num, "text": "content"}]
        """

        path = Path(file_path)
        ext = path.suffix.lower()

        if ext == ".pdf":
            return await cls._read_pdf(file_path)
        elif ext in [".docx", ".doc"]:
            return cls._read_docx(file_path)
        elif ext in [".txt", ".md", ".csv", ".json", ".py", ".js", ".html"]:
            return cls._read_plain_text(file_path)
        elif ext in [".png", ".jpg", ".jpeg", ".webp", ".bmp"]:
            return await cls._read_image_ocr(file_path)
        else:
            raise ValueError(f"Unsupported file format: '{ext}'")

    @classmethod
    async def _read_pdf(cls, file_path: str) -> list[dict]:
        pages = []
        try:
            reader = PdfReader(file_path)
            for idx, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                if text.strip():
                    pages.append({"page": idx + 1, "text": text.strip()})
                else:
                    try:
                        ocr_text = await ocrService.extract_text_from_file(file_path, language="eng")
                        pages.append({"page": idx + 1, "text": ocr_text})
                    except Exception as e:
                        print(f"OCR failed on page {idx+1}: {e}")
                        pages.append({"page": idx + 1, "text": ""})
            return pages
        except Exception as e:
            raise ValueError(f"Error reading PDF: {e}")

    @classmethod
    def _read_docx(cls, file_path: str) -> list[dict]:
        try:
            doc = docx.Document(file_path)
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            full_text = "\n".join(paragraphs)
            return [{"page": 1, "text": full_text}] if full_text else []
        except Exception as e:
            raise ValueError(f"Error reading Word document: {e}")

    @classmethod
    def _read_plain_text(cls, file_path: str) -> list[dict]:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read().strip()
        return [{"page": 1, "text": content}] if content else []

    @classmethod
    async def _read_image_ocr(cls, file_path: str) -> list[dict]:
        ocr_text = await ocrService.extract_text_from_file(file_path)
        filename = Path(file_path).name
        if ocr_text and ocr_text.strip():
            return [{"page": 1, "text": ocr_text.strip()}]
        return [{"page": 1, "text": f"Image document uploaded: {filename}. Contains visual media and graphics."}]
