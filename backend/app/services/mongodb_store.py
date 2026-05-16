import hashlib
import uuid
from datetime import datetime, timezone

from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings
from app.models import ClinicalData, TriageResultPayload


class MongoHandoffStore:
    def __init__(self) -> None:
        self._client = AsyncIOMotorClient(settings.mongodb_uri)
        self._db = self._client[settings.mongodb_db]
        self._reports = self._db.handoff_reports

    def _encrypt_patient_id(self, patient_id: str | None) -> str:
        raw = (patient_id or "anonymous").encode()
        key = settings.patient_encryption_key.encode()
        digest = hashlib.sha256(key + raw).hexdigest()
        return f"enc_{digest[:32]}"

    async def save_handoff(
        self,
        session_id: str,
        patient_id: str | None,
        triage: TriageResultPayload,
        clinical: ClinicalData,
    ) -> str:
        doc = {
            "patient_id": self._encrypt_patient_id(patient_id),
            "session_id": session_id,
            "triage_result": triage.model_dump(),
            "clinical_data": clinical.model_dump(),
            "created_at": datetime.now(timezone.utc),
        }
        result = await self._reports.insert_one(doc)
        return str(result.inserted_id)

    async def health(self) -> bool:
        try:
            await self._client.admin.command("ping")
            return True
        except Exception:
            return False
