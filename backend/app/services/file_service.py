from pathlib import Path
from fastapi import UploadFile
import shutil
import uuid

UPLOAD_DIR=Path("app/uploads")
UPLOAD_DIR.mkdir(parents=True,exist_ok=True)

class FileService:
    @staticmethod
    async def save_pdf(file: UploadFile):
        extension=Path(file.filename).suffix.lower()
        if extension !=".pdf":
            raise ValueError("Pdf file ah annuppu da😪")

        unique_name=file.filename
        file_path=UPLOAD_DIR/unique_name
        with open(file_path,"wb")as buffer:
            shutil.copyfileobj(file.file,buffer)
        
        return{
            "filename":unique_name,
            "original_name":file.filename,
            "path":str(file_path)
        }