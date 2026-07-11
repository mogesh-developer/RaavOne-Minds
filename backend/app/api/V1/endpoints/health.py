# from fastapi import APIRouter

# from app import app

# router=APIRouter()

# @router.get("/health")
# async def health():
#     return {
#         "status": "ok",
#         "message": "Service is running"
#     }

from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health():
    return {
        "status": "healthy",
        "message": "Backend is running"
    }