import os
import httpx
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

class OCRService:
    OCR_SPACE_URL = "https://api.ocr.space/parse/image"

    @classmethod
    async def extract_text_from_file(cls, file_path: str, language: str = "eng") -> str:
        """
        Sends an image or scanned PDF to OCR.space free API and returns extracted text.
        """
        api_key = os.getenv("OCR_SPACE_API_KEY") or os.getenv("OCRSPACE_API_KEY") or "helloworld"
        
        file_path_obj = Path(file_path)
        if not file_path_obj.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                with open(file_path, "rb") as f:
                    payload = {
                        "apikey": api_key,
                        "language": language,
                        "isOverlayRequired": False,
                        "detectOrientation": True,
                        "scale": True,
                        "OCREngine": 2,
                    }
                    files = {
                        "file": (file_path_obj.name, f, cls._get_mime_type(file_path_obj.suffix))
                    }
                    response = await client.post(cls.OCR_SPACE_URL, data=payload, files=files)
                    if response.status_code != 200:
                        print(f"OCR API returned HTTP {response.status_code}")
                        return ""
                    data = response.json()

            if data.get("IsErroredOnProcessing"):
                error_msg = data.get("ErrorMessage", ["OCR Processing failed"])[0]
                print(f"OCR.space Warning: {error_msg}")
                return ""

            parsed_results = data.get("ParsedResults", [])
            extracted_text = []
            for result in parsed_results:
                text = result.get("ParsedText", "").strip()
                if text:
                    extracted_text.append(text)
                    
            return "\n\n".join(extracted_text)
        except Exception as e:
            print(f"OCR extraction exception: {e}")
            return ""

    @staticmethod
    def _get_mime_type(suffix: str) -> str:
        suffix = suffix.lower()
        mime_types = {
            ".pdf": "application/pdf",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".webp": "image/webp",
            ".bmp": "image/bmp",
        }
        return mime_types.get(suffix, "application/octet-stream")

ocrService = OCRService