# from fastapi import FastAPI
# from app.core.config import settings
# from app.api.V1.api import api_router

# app=FastAPI(
#     app_name=settings.app_name,
#     debug=settings.debug,

# )

# @app.get("/")
# def root():
#     return {"message": "Backend is running🚀"}

# app.include_router(
#     api_router,
#     prefix="/api/v1"
# )

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.V1.api import api_router
from app.routes import chat

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    api_router,
    prefix="/api/v1"
)
app.include_router(
    chat.router,
    prefix="/api/v1/chat",
    tags=["Chat"]
)