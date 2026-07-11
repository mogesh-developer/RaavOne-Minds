from app.services import embedding_service
from fastapi import APIRouter, UploadFile, File, HTTPException

from app.services.file_service import FileService
from app.services.pdf_service import PDFService
from app.services.chunk_service import ChunkService
from app.services.embedding_service import EmbeddingService
from app.services.vector_service import VectorService
from app.services.metadata_service import MetadataService

router = APIRouter()
metadata_service = MetadataService()
embedding_service = EmbeddingService()
vector_service = VectorService()
@router.get("/documents")
async def get_documents():
    return metadata_service.get_all_documents()


@router.post("/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    
    try:
        document = await FileService.save_pdf(file)
        pages = PDFService.extract_text(document["path"])
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
        embeddings = embedding_service.generate_embeddings(flat_chunks)

        total_vectors = vector_service.add_embeddings(embeddings)
        metadata_service.save(
            chunks_data,
            document["original_name"]
        )
        # return {
        #     "success": True,
        #     "document": document,

        #     "pages": len(pages),
        #     "content": pages
        # }
#         return {
#     "success": True,
#     "pages": len(pages),
#     "chunks": len(chunks),
#     "data": chunks
# }
        # return {
        #     "success": True,
        #     "pages": len(pages),
        #     "chunks": len(chunks),
        #     "embedding_shape": embeddings.shape
        # }
        return {
            "success": True,
            "pages": len(pages),
            "chunks": len(chunks),
            "embedding_shape": embeddings.shape,
            "vectors": total_vectors,
            "metadata": len(chunks)
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )