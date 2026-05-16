from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import logging
import sys

from app.config import settings
from app.routers import triage
from app.services.mongodb_store import MongoHandoffStore
from app.services.neo4j_graph import Neo4jGraph

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("triage_api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Neo4j Graph Connection...")
    app.state.neo4j = Neo4jGraph()
    logger.info("Initializing MongoDB Connection...")
    app.state.mongo = MongoHandoffStore()
    yield
    logger.info("Shutting down connections...")
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

from fastapi.responses import JSONResponse
from fastapi import Request

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "error": str(exc)},
    )


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
