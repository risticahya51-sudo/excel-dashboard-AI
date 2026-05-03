from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    llm_base_url: str = "https://api.openai.com/v1"
    llm_api_key: str = ""
    llm_model: str = "gpt-3.5-turbo"
    llm_max_tokens: int = 2000
    llm_temperature: float = 0.3

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
