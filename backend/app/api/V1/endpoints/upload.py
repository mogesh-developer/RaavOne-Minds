from typing import List
from app.services import embedding_service
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path

from app.services.file_service import FileService
from app.services.pdf_service import PDFService
from app.services.chunk_service import ChunkService
from app.services.embedding_service import EmbeddingService
from app.services.vector_service import VectorService
from app.services.metadata_service import MetadataService
from app.services.document_reader_service import DocumentReaderService

router = APIRouter()
metadata_service = MetadataService()
embedding_service = EmbeddingService()
vector_service = VectorService()

@router.get("/documents")
async def get_documents():
    return metadata_service.get_all_documents()

@router.get("/documents/{document_name}")
async def get_document_file(document_name: str):
    file_path = Path("app/uploads") / document_name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path, media_type="application/pdf")



@router.post("/documents/upload")
async def upload_documents(files: List[UploadFile] = File(...)):
    results = []
    for file in files:
        file_summary = {
            "filename": file.filename,
            "success": False,
            "error": None,
            "pages": 0,
            "chunks": 0
        }
        try:
            # 1. Save uploaded file to app/uploads directory
            document = await FileService.save_file(file)
            # 2. Extract text (PDF, DOCX, TXT, or Image via OCR.space)
            pages = await DocumentReaderService.extract_text_by_pages(document["path"])
            if not pages:
                raise ValueError("No text could be extracted or OCR returned empty content.")
            # 3. Create Chunks
            chunks_data = []
            for page in pages:
                page_text = page["text"]
                page_number = page["page"]
                page_chunks = ChunkService.chunk_text(page_text)
                for p_chunk in page_chunks:
                    if p_chunk.strip():
                        chunks_data.append({
                            "text": p_chunk,
                            "page": page_number
                        })
            flat_chunks = [item["text"] for item in chunks_data]
            if not flat_chunks:
                raise ValueError("Extracted text was empty after chunking.")
            # 4. Generate Embeddings & Store Vectors + Metadata
            embeddings = embedding_service.generate_embeddings(flat_chunks)
            vector_service.add_embeddings(embeddings)
            metadata_service.save(chunks_data, document["original_name"])
            file_summary["success"] = True
            file_summary["pages"] = len(pages)
            file_summary["chunks"] = len(chunks_data)
        except Exception as e:
            file_summary["error"] = str(e)
        results.append(file_summary)
    return {
        "total_files": len(files),
        "results": results
    }