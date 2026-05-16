# CareRoute — Healthcare Symptom Checker & Triage Bot

Next-generation clinical triage platform built from the architecture spec:

**React UI → FastAPI → BioBERT (NER) → Neo4j (Graph) → Rule/LLM Triage → MongoDB**

> **Disclaimer:** For educational/demo purposes only. Not medical advice. In an emergency, call **911**.

## Features

- **Synonym + BioBERT NER** — extracts symptoms from free text (`USE_BIOBERT=true` optional)
- **Deterministic rule engine** — e.g. chest pain + dyspnea → Level 1 emergency halt
- **Neo4j knowledge graph** — disease–symptom probability matching
- **MongoDB handoff reports** — encrypted patient ID, session UUID, full clinical payload
- **Optional LLM summary** — set `OPENAI_API_KEY` for clinician notes
- **Emergency UI** — red alert banner, 911 CTA, OpenStreetMap hospital routing

## Quick start (Docker)

```bash
cd healthcare-triage
docker compose up --build
```

| Service | URL |
|---------|-----|
| **Web UI** | http://localhost:3000 |
| **API docs** | http://localhost:8000/docs |
| **Neo4j Browser** | http://localhost:7474 (neo4j / healthcare123) |

### Test emergency triage

Enter: *"I have severe chest pain and shortness of breath"* + risk factor **Hypertension**.

## Local development

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
copy ..\.env.example .env
uvicorn main:app --reload
```

Requires Neo4j + MongoDB running (`docker compose up neo4j mongodb neo4j-seed`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 (proxies `/triage` to API).

## Deploy

### Full stack — Docker (VPS, Railway, etc.)

Push repo and run `docker compose up -d` on any host with Docker.

### Split deploy

1. **MongoDB Atlas** — free cluster, set `MONGODB_URI`
2. **Neo4j Aura** — free tier, set `NEO4J_URI` / credentials, run `neo4j/seed.cypher`
3. **Render** — deploy API from `backend/Dockerfile` using `render.yaml`
4. **Vercel** — deploy `frontend/`, set `VITE_API_URL` to Render API URL, update `vercel.json` rewrites

## API

`POST /triage`

```json
{
  "user_input": "chest pain and shortness of breath",
  "patient_id": "optional",
  "risk_factors": ["Hypertension"]
}
```

## MongoDB handoff schema

```json
{
  "patient_id": "enc_…",
  "session_id": "uuid",
  "triage_result": {
    "urgency_level": "Level 1 (Emergency)",
    "primary_assessment": "Potential Acute Myocardial Infarction",
    "action_taken": "Emergency Map Routed"
  },
  "clinical_data": {
    "symptoms": [{"id": "sym_chest_pain", "name": "Chest Pain", "confidence": 0.98}],
    "risk_factors": ["Hypertension"]
  }
}
```

## Original repo

Cloned from [Healthcare-Symptom-Checker-Triage-Bot](https://github.com/Srilipsahoo67-ship-it/Healthcare-Symptom-Checker-Triage-Bot) (unavailable publicly — rebuilt as **CareRoute v2**).

Built by [Princekr801](https://github.com/Princekr801).
