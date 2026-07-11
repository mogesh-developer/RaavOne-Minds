
from app.services.pdf_service import PDFService
from fastapi import APIRouter
from app.api.V1.endpoints import health,upload
# from app.api.V1.endpoints import health

api_router = APIRouter()

api_router.include_router(
    health.router,
    tags=["Health"]
)
api_router.include_router(
    upload.router,
    tags=["Documents"]
)
