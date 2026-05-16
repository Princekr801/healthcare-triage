import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

const HOSPITALS = [
  { name: 'City General Emergency', latOffset: 0.005, lngOffset: -0.002, level: 'Level 1 Trauma' },
  { name: 'Metro Heart Institute', latOffset: 0.015, lngOffset: -0.005, level: 'Cardiac Center' },
  { name: 'Community Urgent Care', latOffset: -0.008, lngOffset: 0.012, level: 'Urgent Care' },
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
  const [locationStatus, setLocationStatus] = useState('Detecting nearest facilities...');

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([position.coords.latitude, position.coords.longitude]);
          setLocationStatus('Showing facilities near your current location.');
        },
        () => {
          setLocationStatus('Location access denied. Showing default region.');
        }
      );
    } else {
      setLocationStatus('Geolocation not supported. Showing default region.');
    }
  }, []);

  return (
    <div className="map-card">
      <h3>Emergency routing — {urgency}</h3>
      <p className="muted">{locationStatus}</p>
      <MapContainer center={center} zoom={13} className="map-container" scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={center} />
        {HOSPITALS.map((h, i) => (
          <Marker key={i} position={[center[0] + h.latOffset, center[1] + h.lngOffset]}>
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
