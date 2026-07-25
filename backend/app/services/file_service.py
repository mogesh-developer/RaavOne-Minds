from pathlib import Path
from fastapi import UploadFile
import shutil

UPLOAD_DIR = Path("app/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

class FileService:
    @staticmethod
    async def save_file(file: UploadFile):
        unique_name = file.filename
        file_path = UPLOAD_DIR / unique_name
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {
            "filename": unique_name,
            "original_name": file.filename,
            "path": str(file_path)
        }

    @staticmethod
    async def save_pdf(file: UploadFile):
        return await FileService.save_file(file)