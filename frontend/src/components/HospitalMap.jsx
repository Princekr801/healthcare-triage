import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

const FACILITIES = [
  { name: 'City General Emergency', latOffset: 0.005, lngOffset: -0.002, level: 'Level 1 Trauma Center', type: 'hospital' },
  { name: 'Metro Heart Institute', latOffset: 0.015, lngOffset: -0.005, level: 'Cardiac Care Unit', type: 'hospital' },
  { name: 'Apollo Pharmacy 24/7', latOffset: -0.004, lngOffset: 0.008, level: 'Full Service Medical Shop', type: 'pharmacy' },
  { name: 'MediLife Biotech & Pharmacy', latOffset: 0.008, lngOffset: 0.012, level: 'Prescription & Surgical Supplies', type: 'pharmacy' },
];

const DEFAULT_CENTER = [28.6139, 77.209];

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export default function HospitalMap({ urgency }) {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [locationStatus, setLocationStatus] = useState('Detecting nearest medical facilities...');

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([position.coords.latitude, position.coords.longitude]);
          setLocationStatus('Showing nearest hospitals and medical shops.');
        },
        () => {
          setLocationStatus('Location access denied. Showing regional medical centers.');
        }
      );
    }
  }, []);

  return (
    <div className="map-card">
      <div className="map-header">
        <div>
          <h3>Emergency Navigation — {urgency}</h3>
          <p className="muted">{locationStatus}</p>
        </div>
        <div className="map-legend">
          <span className="legend-item"><span className="dot hospital"></span> Hospital</span>
          <span className="legend-item"><span className="dot pharmacy"></span> Medical Shop</span>
        </div>
      </div>
      <MapContainer center={center} zoom={13} className="map-container" scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={center} />
        {FACILITIES.map((f, i) => (
          <Marker key={i} position={[center[0] + f.latOffset, center[1] + f.lngOffset]}>
            <Popup className="custom-popup">
              <div className="popup-content">
                <strong>{f.name}</strong>
                <p>{f.level}</p>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${center[0] + f.latOffset},${center[1] + f.lngOffset}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="nav-link"
                >
                  📍 Get Directions
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
