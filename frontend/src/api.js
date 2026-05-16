const API_BASE = import.meta.env.VITE_API_URL || '';

export async function submitTriage({ user_input, patient_id, risk_factors }) {
  const response = await fetch(`${API_BASE}/triage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_input, patient_id, risk_factors }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Triage request failed');
  }
  return response.json();
}

export async function checkHealth() {
  const response = await fetch(`${API_BASE}/health`);
  return response.json();
}
