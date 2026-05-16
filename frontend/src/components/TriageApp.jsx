import { useCallback, useEffect, useState } from 'react';
import { checkHealth, submitTriage } from '../api';
import EmergencyBanner from './EmergencyBanner';
import HospitalMap from './HospitalMap';
import TriageResult from './TriageResult';

const RISK_OPTIONS = [
  'Hypertension',
  'Diabetes',
  'Smoking',
  'Heart Disease',
  'Asthma',
  'Pregnancy',
];

const EXAMPLES = [
  'I have severe chest pain and shortness of breath.',
  'Mild headache and nausea since this morning.',
  'High fever with difficulty breathing for 2 days.',
];

export default function TriageApp() {
  const [text, setText] = useState('');
  const [patientId, setPatientId] = useState('');
  const [riskFactors, setRiskFactors] = useState([]);
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    checkHealth()
      .then(setHealth)
      .catch(() => setHealth({ status: 'offline' }));
  }, []);

  const toggleRisk = (factor) => {
    setRiskFactors((prev) =>
      prev.includes(factor) ? prev.filter((f) => f !== factor) : [...prev, factor],
    );
  };

  const handleTriage = useCallback(async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setRes(null);
    try {
      const data = await submitTriage({
        user_input: text.trim(),
        patient_id: patientId || null,
        risk_factors: riskFactors,
      });
      setRes(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [text, patientId, riskFactors]);

  const isEmergency = res?.action === 'EMERGENCY_HALT';
  const isUrgent = res?.action === 'URGENT_CARE';

  return (
    <div className="app">
      <header className="hero">
        <div className="hero__badge">✨ Premium Triage Engine</div>
        <h1 className="hero__title">
          Care<span>Route</span>
        </h1>
        <p className="hero__subtitle">
          Next-generation clinical symptom triage with graph reasoning and real-time emergency routing.
          <br/><i>Not a substitute for professional medical advice.</i>
        </p>
        <div className="hero__status">
          <span className={`dot dot--${health?.status === 'ok' ? 'ok' : 'warn'}`} />
          API {health?.status === 'ok' ? 'connected' : 'checking…'}
          {health?.neo4j !== undefined && (
            <span className="hero__meta">
              Neo4j {health.neo4j ? '✓' : '✗'} · Mongo {health.mongodb ? '✓' : '✗'}
            </span>
          )}
        </div>
      </header>

      <main className="grid">
        <section className="panel panel--input">
          <h2>Describe your symptoms</h2>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. crushing chest pain with shortness of breath…"
            rows={5}
          />
          <div className="examples">
            {EXAMPLES.map((ex) => (
              <button key={ex} type="button" className="chip" onClick={() => setText(ex)}>
                {ex.slice(0, 42)}…
              </button>
            ))}
          </div>

          <label className="field">
            Patient ID <span className="muted">(optional, encrypted at rest)</span>
            <input
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="MRN-XXXX"
            />
          </label>

          <fieldset className="risks">
            <legend>Risk factors</legend>
            <div className="risk-grid">
              {RISK_OPTIONS.map((r) => (
                <label key={r} className={`risk-pill ${riskFactors.includes(r) ? 'active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={riskFactors.includes(r)}
                    onChange={() => toggleRisk(r)}
                  />
                  {r}
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="button"
            className="btn btn--primary"
            onClick={handleTriage}
            disabled={loading || !text.trim()}
          >
            {loading ? 'Analyzing…' : 'Run Triage Assessment'}
          </button>
          {error && <p className="error">{error}</p>}
        </section>

        <section className="panel panel--result">
          {!res && !loading && (
            <div className="empty-state">
              <div className="empty-state__icon">⌘</div>
              <p>Submit your symptoms to receive an instant clinical triage assessment, including Neo4j graph matches and an encrypted handoff report.</p>
            </div>
          )}
          {loading && (
            <div className="loading-container">
              <div className="skeleton skeleton-title"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text short"></div>
              <div className="skeleton skeleton-card"></div>
              <div className="skeleton skeleton-card"></div>
            </div>
          )}
          {res && (
            <>
              {isEmergency && <EmergencyBanner result={res} />}
              {!isEmergency && isUrgent && (
                <div className="urgent-banner">
                  <h3>Urgent care recommended</h3>
                  <p>{res.primary_assessment}</p>
                </div>
              )}
              <TriageResult result={res} />
              {res.map_required && <HospitalMap urgency={res.urgency_level} />}
            </>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>
          Architecture: React → FastAPI → BioBERT (NER) → Neo4j → Rule/LLM Triage → MongoDB
        </p>
      </footer>
    </div>
  );
}
