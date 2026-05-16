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

const COMMON_SYMPTOMS = [
  { name: 'Fever', icon: '🌡️', solution: 'Rest, hydration, and antipyretics if necessary.' },
  { name: 'Headache', icon: '🧠', solution: 'Quiet environment, hydration, and monitoring.' },
  { name: 'Cough', icon: '💨', solution: 'Warm fluids, humidity, and throat lozenges.' },
  { name: 'Nausea', icon: '🤢', solution: 'Bland diet (BRAT), hydration, and rest.' },
];

const EXAMPLES = [
  'Persistent dry cough with mild fever.',
  'Severe pressure-like chest pain for 20 minutes.',
  'Sudden dizziness and blurred vision.',
];

export default function TriageApp() {
  const [text, setText] = useState('');
  const [patientId, setPatientId] = useState('');
  const [riskFactors, setRiskFactors] = useState([]);
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [health, setHealth] = useState(null);

  const [showSupport, setShowSupport] = useState(false);
  const [showAppointment, setShowAppointment] = useState(false);

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

  const scrollToTriage = () => {
    document.getElementById('triage-tool').scrollIntoView({ behavior: 'smooth' });
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
      <nav className="nav">
        <div className="nav__logo">
          <span className="nav__icon">✚</span> Care<span>Route</span>
        </div>
        <div className="nav__links">
          <a href="#symptoms">Common Symptoms</a>
          <a href="#triage-tool">Clinical Triage</a>
          <button className="btn btn--nav" onClick={() => setShowAppointment(true)}>Find Clinic</button>
        </div>
      </nav>

      <header className="hero">
        <div className="hero__badge">Clinical Intelligence Platform</div>
        <h1 className="hero__title">
          Modern Care <span>Starts Here</span>
        </h1>
        <p className="hero__subtitle">
          An intelligent clinical intake platform designed to bridge the gap between patient symptoms and professional care. 
          By prioritizing diagnostic efficiency and risk-stratified guidance, we help you navigate your health journey with precision.
        </p>
        <button className="btn btn--primary btn--hero" onClick={scrollToTriage}>
          Begin Clinical Assessment
        </button>
      </header>

      <section id="symptoms" className="common-symptoms">
        <div className="section-header">
          <h2>Common Symptoms & Guidance</h2>
          <p>Preliminary guidance for frequently encountered conditions.</p>
        </div>
        <div className="symptoms-grid">
          {COMMON_SYMPTOMS.map((s) => (
            <div key={s.name} className="symptom-card">
              <div className="symptom-card__icon">{s.icon}</div>
              <h3>{s.name}</h3>
              <p>{s.solution}</p>
            </div>
          ))}
        </div>
      </section>

      <main id="triage-tool" className="grid">
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
              <div className="empty-state__icon">✚</div>
              <p>Ready to assist. Please describe your symptoms and select any relevant risk factors to begin your comprehensive health assessment.</p>
            </div>
          )}
          {loading && (
            <div className="loading-container">
              <div className="skeleton skeleton-title"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text short"></div>
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
        <div className="footer__grid">
          <div className="footer__col">
            <div className="footer__logo">Care<span>Route</span></div>
            <p>Advancing clinical outcomes through intelligent symptom navigation and diagnostic efficiency.</p>
            <div className="footer__socials">
              <a href="https://github.com/Princekr801" target="_blank" rel="noreferrer">GitHub</a>
              <a href="https://linkedin.com/in/princekr801" target="_blank" rel="noreferrer">LinkedIn</a>
            </div>
          </div>
          <div className="footer__col">
            <h4>Solutions</h4>
            <a href="#triage-tool">Symptom Assessment</a>
            <a href="#">Clinical Intake</a>
            <a href="#">Risk Stratification</a>
            <a href="#">Patient Guidance</a>
          </div>
          <div className="footer__col">
            <h4>Resources</h4>
            <a href="#">About Our Chatbot</a>
            <a href="#">Clinical Tools</a>
            <a href="#">Documentation</a>
            <a href="#">Support Center</a>
          </div>
          <div className="footer__col">
            <h4>Company</h4>
            <a href="#">Work With Us</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Disclaimer</a>
          </div>
        </div>
        <div className="footer__bottom">
          <p>© 2026 CareRoute Clinical Intelligence. All rights reserved.</p>
          <div className="footer__status">
            <span className={`dot dot--${health?.status === 'ok' ? 'ok' : 'warn'}`} />
            Clinical Nodes: {health?.status === 'ok' ? 'Active' : 'Standby'}
          </div>
        </div>
      </footer>

      {/* Floating Action Pop-ups */}
      <div className="fab-container">
        <button className="fab fab--support" onClick={() => setShowSupport(!showSupport)}>
          <span>?</span>
        </button>
        <button className="fab fab--appointment" onClick={() => setShowAppointment(!showAppointment)}>
          <span>📅</span>
        </button>
      </div>

      {showSupport && (
        <div className="pop-up pop-up--support">
          <div className="pop-up__header">
            <h4>Clinical Support</h4>
            <button onClick={() => setShowSupport(false)}>×</button>
          </div>
          <div className="pop-up__body">
            <p>Do you have a question about the assessment? Our team is here to assist.</p>
            <button className="btn btn--small">Chat with Support</button>
          </div>
        </div>
      )}

      {showAppointment && (
        <div className="pop-up pop-up--appointment">
          <div className="pop-up__header">
            <h4>Next Steps</h4>
            <button onClick={() => setShowAppointment(false)}>×</button>
          </div>
          <div className="pop-up__body">
            <p>Would you like to locate the nearest clinic or schedule an appointment?</p>
            <div className="pop-up__actions">
              <button className="btn btn--small btn--primary" onClick={() => {
                scrollToTriage();
                setShowAppointment(false);
              }}>Locate Clinic</button>
              <button className="btn btn--small">Book Appointment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
