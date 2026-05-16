export default function EmergencyBanner({ result }) {
  return (
    <div className="emergency" role="alert">
      <div className="emergency__pulse" />
      <h2>CRITICAL EMERGENCY DETECTED</h2>
      <p className="emergency__assessment">{result.primary_assessment}</p>
      <p className="emergency__action">{result.action_taken}</p>
      <div className="emergency__cta">
        <a href="tel:911" className="btn btn--emergency">
          Call 911 Now
        </a>
        <span className="emergency__note">
          Nearest emergency facilities shown below. Do not drive yourself if symptoms are severe.
        </span>
      </div>
    </div>
  );
}
