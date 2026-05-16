import logging

from fastapi import APIRouter, Depends, Request

from app.models import TriageRequest, TriageResponse
from app.services.mongodb_store import MongoHandoffStore
from app.services.neo4j_graph import Neo4jGraph
from app.services.triage_engine import run_triage

logger = logging.getLogger("triage_api.router")

router = APIRouter(tags=["triage"])


def get_graph(request: Request) -> Neo4jGraph:
    return request.app.state.neo4j


def get_store(request: Request) -> MongoHandoffStore:
    return request.app.state.mongo


@router.post("/triage", response_model=TriageResponse)
async def process_triage(
    body: TriageRequest,
    graph: Neo4jGraph = Depends(get_graph),
    store: MongoHandoffStore = Depends(get_store),
) -> TriageResponse:
    logger.info(f"Received triage request. Risk factors: {len(body.risk_factors)}")
    return await run_triage(
        user_input=body.user_input,
        patient_id=body.patient_id,
        risk_factors=body.risk_factors,
        graph=graph,
        store=store,
    )
