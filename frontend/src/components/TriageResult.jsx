const URGENCY_CLASS = {
  'Level 1 (Emergency)': 'level-1',
  'Level 2 (Urgent)': 'level-2',
  'Level 3 (Self-Care)': 'level-3',
};

export default function TriageResult({ result }) {
  const levelClass = URGENCY_CLASS[result.urgency_level] || 'level-3';

  return (
    <div className="result">
      <div className={`urgency-badge ${levelClass}`}>{result.urgency_level}</div>
      <h3>{result.primary_assessment}</h3>
      <p className="result__action">{result.action_taken}</p>

      {result.llm_summary && (
        <blockquote className="llm-summary">
          <span>AI clinical note</span>
          {result.llm_summary}
        </blockquote>
      )}

      <div className="symptoms">
        <h4>Extracted symptoms</h4>
        {result.clinical_data.symptoms.length === 0 ? (
          <p className="muted">No mapped symptoms — describe symptoms more specifically.</p>
        ) : (
          <ul>
            {result.clinical_data.symptoms.map((s) => (
              <li key={s.id}>
                <span>{s.name}</span>
                <span className="conf">{(s.confidence * 100).toFixed(0)}%</span>
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
          <h4>Neo4j graph matches</h4>
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
        <h4>MongoDB handoff</h4>
        <dl>
          <dt>Session</dt>
          <dd className="mono">{result.session_id}</dd>
          <dt>Report ID</dt>
          <dd className="mono">{result.handoff_id || '—'}</dd>
        </dl>
      </div>
    </div>
  );
}
