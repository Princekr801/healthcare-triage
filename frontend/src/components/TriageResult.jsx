const URGENCY_CLASS = {
  'Level 1 (Emergency)': 'level-1',
  'Level 2 (Urgent)': 'level-2',
  'Level 3 (Self-Care)': 'level-3',
};

const LEVEL_DESCRIPTIONS = {
  'Level 1 (Emergency)': '🚨 CRITICAL: This indicates a high-risk or life-threatening condition. Please seek immediate emergency medical care (go to the nearest Emergency Room or call emergency services). Do not attempt to drive yourself if experiencing severe symptoms.',
  'Level 2 (Urgent)': '⚠️ URGENT: While not immediately life-threatening, your symptoms suggest a condition that needs timely evaluation. You should visit a local Urgent Care clinic or consult a physician within 24 hours.',
  'Level 3 (Self-Care)': '✅ SELF-CARE: Your symptoms match mild, low-risk conditions. It is generally safe to rest, stay hydrated, and manage symptoms at home. However, please monitor your condition closely and seek care if your symptoms worsen.',
};

export default function TriageResult({ result }) {
  const levelClass = URGENCY_CLASS[result.urgency_level] || 'level-3';
  const levelDesc = LEVEL_DESCRIPTIONS[result.urgency_level] || LEVEL_DESCRIPTIONS['Level 3 (Self-Care)'];

  return (
    <div className="result">
      <div className="result-header">
        <div className={`urgency-badge ${levelClass}`}>{result.urgency_level}</div>
      </div>
      <div className={`level-explanation-box ${levelClass}-bg`}>
        <p>{levelDesc}</p>
      </div>
      <h3>{result.primary_assessment}</h3>
      <p className="result__action">{result.action_taken}</p>

      {result.llm_summary && (
        <blockquote className="llm-summary">
          <span>Clinician Summary & Assessment</span>
          {result.llm_summary}
        </blockquote>
      )}

      <div className="symptoms">
        <h4>Identified Clinical Indicators</h4>
        {result.clinical_data.symptoms.length === 0 ? (
          <p className="muted">No specific clinical indicators identified. Please provide more descriptive details.</p>
        ) : (
          <ul>
            {result.clinical_data.symptoms.map((s) => (
              <li key={s.id}>
                <span>{s.name}</span>
                <span className="conf">{(s.confidence * 100).toFixed(0)}% Match</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {result.clinical_data.risk_factors?.length > 0 && (
        <div className="risks-readout">
          <h4>Risk factors</h4>
          <div className="tags">
            {result.clinical_data.risk_factors.map((r) => (
              <span key={r} className="tag">
                {r}
              </span>
            ))}
          </div>
        </div>
      )}

      {result.matches?.length > 0 && (
        <div className="matches">
          <h4>Clinical Correlation & Differential Insights</h4>
          <ul>
            {result.matches.map((m) => (
              <li key={m.disease}>
                <strong>{m.disease}</strong>
                <span>{m.urgency_level}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="handoff">
        <h4>Secure Clinical Handoff</h4>
        <dl>
          <dt>Session ID</dt>
          <dd className="mono">{result.session_id}</dd>
          <dt>Assessment ID</dt>
          <dd className="mono">{result.handoff_id || 'Generating...'}</dd>
        </dl>
        <button 
          className="download-report-btn"
          onClick={() => {
            const report = `
CLINICAL TRIAGE REPORT
----------------------
Session: ${result.session_id}
Assessment ID: ${result.handoff_id}
Urgency: ${result.urgency_level}
Primary Assessment: ${result.primary_assessment}

CLINICAL SUMMARY:
${result.llm_summary || 'No summary generated.'}

SYMPTOMS IDENTIFIED:
${result.clinical_data.symptoms.map(s => `- ${s.name} (${(s.confidence * 100).toFixed(0)}%)`).join('\n')}

RISK FACTORS:
${result.clinical_data.risk_factors.join(', ') || 'None reported'}

ACTION TAKEN:
${result.action_taken}
            `.trim();
            
            const blob = new Blob([report], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `handoff-report-${result.session_id.slice(0, 8)}.txt`;
            a.click();
          }}
        >
          📄 Download Clinical Report
        </button>
      </div>
    </div>
  );
}
