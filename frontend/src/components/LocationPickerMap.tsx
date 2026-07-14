import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import { MapPin, Navigation } from 'lucide-react';

interface Props {
  gpsLocation: string;
  addressString?: string;
  onChange: (newLoc: string) => void;
}

// Custom hook to handle map clicks
function LocationMarker({ position, setPosition, onChange }: { position: [number, number], setPosition: (p: [number, number]) => void, onChange: (loc: string) => void }) {
  const map = useMapEvents({
    click(e) {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      onChange(`${newPos[0].toFixed(5)}, ${newPos[1].toFixed(5)}`);
    }
  });

  // Pan to position if it changes from outside (like live fetch)
  useEffect(() => {
    map.flyTo(position, map.getZoom());
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Selected Site Location</Popup>
    </Marker>
  );
}

export default function LocationPickerMap({ gpsLocation, addressString, onChange }: Props) {
  const [position, setPosition] = useState<[number, number]>([13.0827, 80.2707]);
  const [fetching, setFetching] = useState(false);
  const [permissionError, setPermissionError] = useState("");

  useEffect(() => {
    if (gpsLocation) {
      const parts = gpsLocation.split(',');
      if (parts.length === 2) {
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          setPosition([lat, lng]);
        }
      }
    }
  }, [gpsLocation]);

  const fetchLiveLocation = () => {
    setFetching(true);
    setPermissionError("");
    
    if (!navigator.geolocation) {
      setPermissionError("Geolocation is not supported by your browser");
      setFetching(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setPosition(newPos);
        onChange(`${newPos[0].toFixed(5)}, ${newPos[1].toFixed(5)}`);
        setFetching(false);
      },
      (err) => {
        console.error("Error fetching location:", err);
        setPermissionError(err.message || "Permission denied or unable to fetch location");
        setFetching(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const fetchAddressLocation = async () => {
    if (!addressString || addressString.trim().length < 3) {
      setPermissionError("Please enter a valid Village and PIN code first.");
      return;
    }
    setFetching(true);
    setPermissionError("");
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const newPos: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        setPosition(newPos);
        onChange(`${newPos[0].toFixed(5)}, ${newPos[1].toFixed(5)}`);
      } else {
        setPermissionError("Could not find coordinates for this address. Please try manual map pin or Live GPS.");
      }
    } catch (err) {
      console.error(err);
      setPermissionError("Error connecting to geocoding service.");
    }
    setFetching(false);
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <MapPin size={16} /> Interactive Map Picker
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            type="button" 
            onClick={fetchAddressLocation} 
            disabled={fetching || !addressString}
            className="btn btn-secondary" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--accent-amber)', color: 'var(--accent-amber)', background: 'rgba(245, 158, 11, 0.1)' }}
          >
            <MapPin size={14} className={fetching ? "animate-bounce" : ""} />
            {fetching ? "Searching..." : "Search Address"}
          </button>
          
          <button 
            type="button" 
            onClick={fetchLiveLocation} 
            disabled={fetching}
            className="btn btn-secondary" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.1)' }}
          >
            <Navigation size={14} className={fetching ? "animate-pulse" : ""} />
            {fetching ? "Locating..." : "Live Device GPS"}
          </button>
        </div>
      </div>

      {permissionError && (
        <div style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.8rem', borderRadius: '4px' }}>
          {permissionError}
        </div>
      )}

      <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' }}>
        <MapContainer center={position} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} onChange={onChange} />
        </MapContainer>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Click anywhere on the map to manually set the site location pin.</p>
    </div>
  );
}
