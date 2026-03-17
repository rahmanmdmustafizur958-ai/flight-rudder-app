const FINLAND_BOUNDS = {
  lamin: 59.5,
  lamax: 70.1,
  lomin: 20.5,
  lomax: 31.6
};

const state = {
  map: null,
  markers: new Map(),
  selectedFlightId: null,
  updateInterval: null,
};

function initMap() {
  const tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  state.map = L.map('map', {
    zoomControl: false,
    attributionControl: false
  }).setView([64.0, 26.0], 5);

  L.tileLayer(tileUrl, {
    attribution,
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(state.map);

  document.getElementById('close-panel').addEventListener('click', () => {
    state.selectedFlightId = null;
    document.getElementById('flight-details').classList.add('hidden');
    updateMarkersVisuals();
  });

  fetchFlights();
  state.updateInterval = setInterval(fetchFlights, 10000); 
}

function getIcon(heading, isSelected) {
  const color = isSelected ? '#ffffff' : 'var(--accent)';
  const html = `
    <div style="transform: rotate(${heading || 0}deg); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: ${color}; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); transition: transform 0.3s ease;">
      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
      </svg>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'plane-marker-container',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
}

async function fetchFlights() {
  const statusElem = document.getElementById('status-text');
  try {
    const url = `https://opensky-network.org/api/states/all?lamin=${FINLAND_BOUNDS.lamin}&lomin=${FINLAND_BOUNDS.lomin}&lamax=${FINLAND_BOUNDS.lamax}&lomax=${FINLAND_BOUNDS.lomax}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    
    const data = await response.json();
    processFlights(data.states || []);
    
    const now = new Date();
    statusElem.textContent = `Live | Active Flights: ${data.states ? data.states.length : 0} | Last Update: ${now.toLocaleTimeString()}`;
  } catch (error) {
    console.error('API Error:', error);
    statusElem.textContent = 'Error connecting to radar. Retrying...';
  }
}

function processFlights(states) {
  const currentIds = new Set();

  states.forEach(flight => {
    const [icao24, callsign, origin_country, time_position, last_contact, longitude, latitude, baro_altitude, on_ground, velocity, true_track] = flight;
    if (!longitude || !latitude) return;
    
    const id = icao24;
    currentIds.add(id);

    const flightData = {
      id, 
      callsign: callsign ? callsign.trim() : 'N/A',
      country: origin_country,
      alt: baro_altitude,
      speed: velocity,
      heading: true_track
    };

    const isSelected = id === state.selectedFlightId;

    if (state.markers.has(id)) {
      const marker = state.markers.get(id);
      marker.setLatLng([latitude, longitude]);
      marker.setIcon(getIcon(true_track, isSelected));
      marker.flightData = flightData;
    } else {
      const marker = L.marker([latitude, longitude], { icon: getIcon(true_track, isSelected) }).addTo(state.map);
      marker.flightData = flightData;
      marker.on('click', () => {
        state.selectedFlightId = id;
        showDetails(flightData);
        updateMarkersVisuals();
      });
      state.markers.set(id, marker);
    }
  });

  for (const [id, marker] of state.markers.entries()) {
    if (!currentIds.has(id)) {
      state.map.removeLayer(marker);
      state.markers.delete(id);
    }
  }

  if (state.selectedFlightId && state.markers.has(state.selectedFlightId)) {
    showDetails(state.markers.get(state.selectedFlightId).flightData);
  } else if (state.selectedFlightId && !state.markers.has(state.selectedFlightId)) {
    document.getElementById('close-panel').click();
  }
}

function showDetails(data) {
  const panel = document.getElementById('flight-details');
  const content = document.getElementById('details-content');
  panel.classList.remove('hidden');
  
  const speed = data.speed ? Math.round(data.speed * 3.6) + ' km/h' : 'N/A';
  const alt = data.alt ? Math.round(data.alt) + ' m' : 'Ground';
  const heading = data.heading ? Math.round(data.heading) + '°' : 'N/A';
  
  content.innerHTML = `
    <div class="stat-row">
      <span class="stat-label">Callsign</span>
      <span class="stat-value highlight-value">${data.callsign}</span>
    </div>
    <div class="stat-row">
      <span class="stat-label">Origin Country</span>
      <span class="stat-value">${data.country}</span>
    </div>
    <div class="stat-row">
      <span class="stat-label">Altitude</span>
      <span class="stat-value">${alt}</span>
    </div>
    <div class="stat-row">
      <span class="stat-label">Velocity</span>
      <span class="stat-value">${speed}</span>
    </div>
    <div class="stat-row">
      <span class="stat-label">True Track</span>
      <span class="stat-value">${heading}</span>
    </div>
    <div class="stat-row">
      <span class="stat-label">ICAO24 Hex</span>
      <span class="stat-value" style="font-family: monospace;">${data.id.toUpperCase()}</span>
    </div>
  `;
}

function updateMarkersVisuals() {
  for (const [id, marker] of state.markers.entries()) {
    const isSelected = id === state.selectedFlightId;
    marker.setIcon(getIcon(marker.flightData.heading, isSelected));
    
    if (marker._icon) {
      if (state.selectedFlightId && !isSelected) {
        marker._icon.style.opacity = '0.3';
        marker.setZIndexOffset(0);
      } else {
        marker._icon.style.opacity = '1';
        if (isSelected) marker.setZIndexOffset(1000);
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', initMap);
