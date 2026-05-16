# CareRoute: Clinical Intake & Healthcare Triage Platform 🏥✨

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Neo4j](https://img.shields.io/badge/Database-Neo4j-008CC1?style=for-the-badge&logo=neo4j&logoColor=white)](https://neo4j.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

CareRoute is a premium, production-grade clinical triage platform designed to streamline the patient intake process. By combining **Graph-based clinical reasoning** with **Real-time emergency routing**, CareRoute provides patients with immediate guidance while delivering secure, clinician-ready handoff reports.

---

## 🌟 Key Features

### 👨‍⚕️ Clinical Intelligence
- **Graph Knowledge Base:** Uses Neo4j to map complex symptom-disease relationships for accurate differential assessment.
- **Smart NER:** Automatically extracts clinical entities from raw patient text using advanced NLP.
- **Urgency Classification:** Instant categorization into Level 1 (Emergency), Level 2 (Urgent), or Level 3 (Self-Care).

### 📍 Emergency Navigation
- **Real-time Map Routing:** Integrated OpenStreetMap/Leaflet maps that detect your location.
- **Facility Discovery:** Locates the nearest Hospitals (ER) and Medical Shops (Pharmacies).
- **Navigation Links:** Direct "Get Directions" buttons that open Google Maps for immediate transit.

### 📑 Secure Clinical Handoff
- **Handoff Reports:** Generates secure, unique assessment IDs for every session.
- **Clinician Summaries:** Automated clinical notes for doctors to review during intake.
- **Downloadable Reports:** Patients can download a professional `.txt` report to show healthcare providers.

---

## 🚀 Tech Stack

- **Frontend:** React + Vite + Vanilla CSS (Premium Dark Theme)
- **Backend:** FastAPI (Python)
- **Knowledge Graph:** Neo4j (Aura Cloud)
- **Data Store:** MongoDB Atlas
- **NLP/AI:** OpenAI GPT-4o-mini (for clinical summaries)

---

## 🛠️ Setup & Installation

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- Neo4j Aura (Free Tier)
- MongoDB Atlas (Free Tier)

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```
Create a `.env` file in the `backend` folder:
```env
NEO4J_URI=your_neo4j_uri
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password
MONGODB_URI=your_mongodb_uri
OPENAI_API_KEY=your_key
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` folder:
```env
VITE_API_URL=http://127.0.0.1:8000
```

### 4. Running the Platform
**Start Backend:**
```bash
cd backend
uvicorn main:app --reload
```
**Start Frontend:**
```bash
cd frontend
npm run dev
```

---

## 🛡️ Privacy & Security
- **Data Encryption:** All patient handoff reports are encrypted at rest in MongoDB.
- **Clinician Focus:** All AI-generated data is presented as "Clinical Correlation" to support, not replace, professional medical judgment.

---

## 👨‍💻 Author
**Prince Kumar**
- [GitHub](https://github.com/Princekr801)
- [LinkedIn](https://linkedin.com/in/prince-kumar)

---
*Disclaimer: This platform is for demonstration and triage support only. In case of a real medical emergency, always call local emergency services immediately.*
