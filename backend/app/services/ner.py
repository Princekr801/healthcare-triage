import re
from dataclasses import dataclass

from app.config import settings

SYNONYMS: dict[str, str] = {
    "chest pain": "sym_chest_pain",
    "chest discomfort": "sym_chest_pain",
    "angina": "sym_chest_pain",
    "shortness of breath": "sym_dyspnea",
    "breathing difficulty": "sym_dyspnea",
    "difficulty breathing": "sym_dyspnea",
    "dyspnea": "sym_dyspnea",
    "can't breathe": "sym_dyspnea",
    "fever": "sym_fever",
    "high temperature": "sym_fever",
    "headache": "sym_headache",
    "severe headache": "sym_headache",
    "nausea": "sym_nausea",
    "vomiting": "sym_nausea",
    "dizziness": "sym_dizziness",
    "lightheaded": "sym_dizziness",
    "abdominal pain": "sym_abdominal_pain",
    "stomach pain": "sym_abdominal_pain",
    "cough": "sym_cough",
    "persistent cough": "sym_cough",
}

SYMPTOM_LABELS: dict[str, str] = {
    "sym_chest_pain": "Chest Pain",
    "sym_dyspnea": "Shortness of Breath",
    "sym_fever": "Fever",
    "sym_headache": "Headache",
    "sym_nausea": "Nausea",
    "sym_dizziness": "Dizziness",
    "sym_abdominal_pain": "Abdominal Pain",
    "sym_cough": "Cough",
}

_ner_pipeline = None


@dataclass
class ExtractedSymptom:
    id: str
    name: str
    confidence: float


def _load_biobert():
    global _ner_pipeline
    if _ner_pipeline is not None:
        return _ner_pipeline
    if not settings.use_biobert:
        return None
    try:
        from transformers import pipeline

        _ner_pipeline = pipeline(
            "ner",
            model="dmis-lab/biobert-v1.1-pubmed-pmc-v1.1-ner",
            aggregation_strategy="simple",
        )
        return _ner_pipeline
    except Exception:
        return None


def _synonym_extract(text: str) -> list[ExtractedSymptom]:
    lowered = text.lower()
    found: dict[str, ExtractedSymptom] = {}
    for phrase, sym_id in sorted(SYNONYMS.items(), key=lambda x: -len(x[0])):
        if phrase in lowered:
            found[sym_id] = ExtractedSymptom(
                id=sym_id,
                name=SYMPTOM_LABELS[sym_id],
                confidence=0.92,
            )
    return list(found.values())


def _biobert_extract(text: str) -> list[ExtractedSymptom]:
    ner = _load_biobert()
    if ner is None:
        return []
    entities = ner(text)
    found: dict[str, ExtractedSymptom] = {}
    for entity in entities:
        word = entity.get("word", "").lower().strip()
        score = float(entity.get("score", 0.5))
        for phrase, sym_id in SYNONYMS.items():
            if phrase in word or word in phrase:
                prev = found.get(sym_id)
                if prev is None or score > prev.confidence:
                    found[sym_id] = ExtractedSymptom(
                        id=sym_id,
                        name=SYMPTOM_LABELS[sym_id],
                        confidence=round(score, 2),
                    )
    return list(found.values())


def extract_symptoms(text: str) -> list[ExtractedSymptom]:
    text = re.sub(r"\s+", " ", text.strip())
    synonym_hits = _synonym_extract(text)
    biobert_hits = _biobert_extract(text)
    merged: dict[str, ExtractedSymptom] = {s.id: s for s in synonym_hits}
    for hit in biobert_hits:
        existing = merged.get(hit.id)
        if existing is None or hit.confidence > existing.confidence:
            merged[hit.id] = hit
    return list(merged.values())
