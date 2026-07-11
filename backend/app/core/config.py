from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "RAG"
    APP_VERSION: str = "0.1.0"
    debug: bool = True
    groq_api_key: str

    class Config:
        env_file = ".env"

settings = Settings()