import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

const HOSPITALS = [
  { name: 'City General Emergency', lat: 28.6139, lng: 77.209, level: 'Level 1' },
  { name: 'Metro Heart Institute', lat: 28.6289, lng: 77.2065, level: 'Cardiac' },
  { name: 'Community Urgent Care', lat: 28.6048, lng: 77.2253, level: 'Urgent' },
];

const DEFAULT_CENTER = [28.6139, 77.209];

export default function HospitalMap({ urgency }) {
  return (
    <div className="map-card">
      <h3>Emergency routing — {urgency}</h3>
      <p className="muted">OpenStreetMap · Sample facilities near default region</p>
      <MapContainer center={DEFAULT_CENTER} zoom={13} className="map-container" scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {HOSPITALS.map((h) => (
          <Marker key={h.name} position={[h.lat, h.lng]}>
            <Popup>
              <strong>{h.name}</strong>
              <br />
              {h.level}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
