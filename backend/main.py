from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import triage
from app.services.mongodb_store import MongoHandoffStore
from app.services.neo4j_graph import Neo4jGraph


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.neo4j = Neo4jGraph()
    app.state.mongo = MongoHandoffStore()
    yield
    app.state.neo4j.close()
    app.state.mongo._client.close()


app = FastAPI(
    title="Healthcare Symptom Checker & Triage API",
    description="BioBERT NER → Neo4j Graph → Rule/LLM Triage → MongoDB Handoff",
    version="2.0.0",
    lifespan=lifespan,
)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(triage.router)


@app.get("/health")
async def health():
    neo4j_ok = app.state.neo4j.health()
    mongo_ok = await app.state.mongo.health()
    return {
        "status": "ok" if neo4j_ok and mongo_ok else "degraded",
        "neo4j": neo4j_ok,
        "mongodb": mongo_ok,
    }


@app.get("/")
async def root():
    return {
        "service": "Healthcare Triage API",
        "docs": "/docs",
        "triage": "POST /triage",
    }
