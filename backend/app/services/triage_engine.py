import logging
import uuid

from app.models import ClinicalData, SymptomEntity, TriageResponse
from app.services.mongodb_store import MongoHandoffStore
from app.services.neo4j_graph import Neo4jGraph
from app.services.ner import extract_symptoms

logger = logging.getLogger("triage_api.engine")


URGENCY_RANK = {
    "Level 1 (Emergency)": 1,
    "Level 2 (Urgent)": 2,
    "Level 3 (Self-Care)": 3,
}


def _normalize_urgency(raw: str) -> str:
    if raw.startswith("Level 1"):
        return "Level 1 (Emergency)"
    if raw.startswith("Level 2"):
        return "Level 2 (Urgent)"
    return "Level 3 (Self-Care)"


def _rule_engine(symptom_ids: list[str], risk_factors: list[str]) -> dict | None:
    ids = set(symptom_ids)
    risks = {r.lower() for r in risk_factors}

    if "sym_chest_pain" in ids and "sym_dyspnea" in ids:
        return {
            "urgency_level": "Level 1 (Emergency)",
            "primary_assessment": "Potential Acute Myocardial Infarction",
            "action": "EMERGENCY_HALT",
            "action_taken": "Emergency Map Routed",
            "map_required": True,
        }

    if "sym_chest_pain" in ids and "hypertension" in risks:
        return {
            "urgency_level": "Level 1 (Emergency)",
            "primary_assessment": "Cardiac Event Risk — Chest Pain with Hypertension",
            "action": "EMERGENCY_HALT",
            "action_taken": "Emergency Map Routed",
            "map_required": True,
        }

    if "sym_fever" in ids and "sym_dyspnea" in ids:
        return {
            "urgency_level": "Level 2 (Urgent)",
            "primary_assessment": "Possible Respiratory Infection — Urgent Evaluation",
            "action": "URGENT_CARE",
            "action_taken": "Urgent Care Routing Recommended",
            "map_required": True,
        }

    if "sym_headache" in ids and "sym_nausea" in ids:
        return {
            "urgency_level": "Level 2 (Urgent)",
            "primary_assessment": "Neurological Symptoms — Urgent Assessment",
            "action": "URGENT_CARE",
            "action_taken": "Urgent Care Routing Recommended",
            "map_required": False,
        }

    return None


async def _llm_summary(user_input: str, assessment: str, symptoms: list[str]) -> str | None:
    from app.config import settings

    if not settings.openai_api_key:
        return None
    try:
        import httpx

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.openai_api_key}"},
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {
                            "role": "system",
                            "content": (
                                "You are a clinical triage assistant. Provide a brief, "
                                "non-diagnostic summary for clinicians. Max 2 sentences."
                            ),
                        },
                        {
                            "role": "user",
                            "content": (
                                f"Patient text: {user_input}\n"
                                f"Symptoms: {', '.join(symptoms)}\n"
                                f"Assessment: {assessment}"
                            ),
                        },
                    ],
                    "max_tokens": 120,
                },
            )
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"].strip()
    except httpx.TimeoutException:
        logger.warning("OpenAI API timeout. Skipping LLM summary.")
        return None
    except Exception as e:
        logger.error(f"OpenAI API error: {e}", exc_info=True)
        return None


async def run_triage(
    user_input: str,
    patient_id: str | None,
    risk_factors: list[str],
    graph: Neo4jGraph,
    store: MongoHandoffStore,
) -> TriageResponse:
    session_id = str(uuid.uuid4())
    extracted = extract_symptoms(user_input)
    symptom_ids = [s.id for s in extracted]

    clinical = ClinicalData(
        symptoms=[
            SymptomEntity(id=s.id, name=s.name, confidence=s.confidence)
            for s in extracted
        ],
        risk_factors=risk_factors,
    )

    rule_hit = _rule_engine(symptom_ids, risk_factors)
    graph_matches: list[dict] = []

    if rule_hit:
        urgency = rule_hit["urgency_level"]
        assessment = rule_hit["primary_assessment"]
        action = rule_hit["action"]
        action_taken = rule_hit["action_taken"]
        map_required = rule_hit["map_required"]
    else:
        graph_matches = graph.query_diseases(symptom_ids)
        if graph_matches:
            top = graph_matches[0]
            urgency = _normalize_urgency(top.get("urgency_level", "Level 3"))
            assessment = top.get("disease", "Clinical correlation needed")
            if urgency == "Level 1 (Emergency)":
                action = "EMERGENCY_HALT"
                action_taken = "Emergency Map Routed"
                map_required = True
            elif urgency == "Level 2 (Urgent)":
                action = "URGENT_CARE"
                action_taken = "Urgent Care Routing Recommended"
                map_required = True
            else:
                action = "SELF_CARE"
                action_taken = "Self-Care Guidance Provided"
                map_required = False
        else:
            urgency = "Level 3 (Self-Care)"
            assessment = (
                "No high-risk symptom pattern detected — monitor and seek care if worsening"
            )
            action = "SELF_CARE"
            action_taken = "Self-Care Guidance Provided"
            map_required = False

    triage_payload = TriageResultPayload(
        urgency_level=urgency,  # type: ignore[arg-type]
        primary_assessment=assessment,
        action_taken=action_taken,
    )

    try:
        handoff_id = await store.save_handoff(
            session_id, patient_id, triage_payload, clinical
        )
        logger.info(f"Saved handoff for session {session_id} -> MongoDB ID: {handoff_id}")
    except Exception as e:
        logger.error(f"Failed to save handoff to MongoDB: {e}", exc_info=True)
        handoff_id = "error_saving"

    logger.info(f"Triage complete for session {session_id} - Urgency: {urgency}")

    llm_summary = await _llm_summary(
        user_input, assessment, [s.name for s in extracted]
    )

    return TriageResponse(
        session_id=session_id,
        urgency_level=urgency,
        primary_assessment=assessment,
        action=action,
        action_taken=action_taken,
        map_required=map_required,
        matches=graph_matches,
        clinical_data=clinical,
        handoff_id=handoff_id,
        llm_summary=llm_summary,
    )
