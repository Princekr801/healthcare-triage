# CareRoute ✨ Premium Healthcare Triage Platform

A next-generation clinical triage platform built with a high-end dynamic UI and advanced AI-driven architecture.

**React UI (Vite) → FastAPI → BioBERT (NER) → Neo4j (Graph) → Rule/LLM Triage → MongoDB**

> **Disclaimer:** For educational/demo purposes only. Not medical advice. In an emergency, call **911**.

## Features

- **Premium UI Redesign:** Dark mode glassmorphism with dynamic gradients, sleek micro-animations, and skeleton loading states.
- **Dynamic Geolocation Map:** Uses browser Geolocation API to instantly plot your location and route you to the nearest emergency facilities.
- **BioBERT NER & Synonyms:** Accurately extracts clinical symptoms from free text (`USE_BIOBERT=true`).
- **Deterministic Rule Engine:** e.g., chest pain + dyspnea → Level 1 emergency halt.
- **Neo4j Knowledge Graph:** Maps extracted symptoms to disease probabilities.
- **MongoDB Handoff:** Stores encrypted patient ID, session UUID, and full clinical payload for provider handoff.
- **AI Clinician Notes:** Automatically synthesizes a 2-sentence summary for the receiving physician (`OPENAI_API_KEY`).
- **Emergency UI:** Immediate red alert pulsing banner and one-tap 911 CTA.

## Quick Start (Docker)

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| **Web UI** | http://localhost:3000 |
| **API Docs** | http://localhost:8000/docs |
| **Neo4j Browser** | http://localhost:7474 (neo4j / healthcare123) |

### Test Triage
Enter: *"I have severe chest pain and shortness of breath"* + risk factor **Hypertension**.

## Deployment

### Vercel + Render (Split Deployment)
1. **Database Setup:** 
   - Deploy **MongoDB Atlas** (Free Tier) and note the `MONGODB_URI`.
   - Deploy **Neo4j Aura** (Free Tier), run `neo4j/seed.cypher` using the console, and note credentials.
2. **Backend (Render / Railway):**
   - Connect your GitHub repo and select the `backend` directory.
   - Deploy as a Docker service or standard Python web service.
   - Set env vars: `MONGODB_URI`, `NEO4J_URI`, `NEO4J_PASSWORD`.
   - Note your Backend API URL.
3. **Frontend (Vercel):**
   - Connect the repo to Vercel and select `frontend` as the root directory.
   - Set the `VITE_API_URL` environment variable to your Backend API URL (e.g., `https://my-backend.onrender.com`).
   - Deploy.

### Full-Stack VPS Deployment (Docker)
Push the repository to a VPS (DigitalOcean, AWS, etc.) and run:
```bash
docker compose up -d
```
The application handles its own Nginx proxy routing via the frontend container.

## Architecture & API
`POST /triage`
```json
{
  "user_input": "chest pain and shortness of breath",
  "patient_id": "optional",
  "risk_factors": ["Hypertension"]
}
```

Built by [Princekr801](https://github.com/Princekr801). Upgraded to Next-Level Premium.
