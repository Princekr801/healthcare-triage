from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "healthcare123"
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db: str = "healthcare_triage"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    use_biobert: bool = False
    openai_api_key: str = ""
    patient_encryption_key: str = "dev-only-change-in-production-32b!"


settings = Settings()
