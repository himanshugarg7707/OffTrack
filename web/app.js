/**
 * OffTrack - Campus route planning and emergency dispatch dashboard
 * Leaflet/OpenStreetMap basemap with Java API and local graph simulation
 */

(function () {
  'use strict';

  // Approximate demo pins around Chitkara University's published campus location.
  const CAMPUS_LOCATIONS = [
    { id: 'A', name: 'Main Gate', type: 'GATE', isMedicalCentre: false, lat: 30.51450, lng: 76.65960 },
    { id: 'B', name: 'Pie Girls Hostel', type: 'HOSTEL', isMedicalCentre: false, lat: 30.51472, lng: 76.66218 },
    { id: 'C', name: 'Le Corbusier Block', type: 'BUILDING', isMedicalCentre: false, lat: 30.51728, lng: 76.66053 },
    { id: 'D', name: 'Library', type: 'BUILDING', isMedicalCentre: false, lat: 30.51770, lng: 76.66010 },
    { id: 'E', name: 'Turing Block', type: 'BUILDING', isMedicalCentre: false, lat: 30.51625, lng: 76.66050 },
    { id: 'F', name: 'Neelam Hospital', type: 'MEDICAL_CENTRE', isMedicalCentre: true, lat: 30.51780, lng: 76.65734 },
    { id: 'G', name: 'Martin Luther Block', type: 'BUILDING', isMedicalCentre: false, lat: 30.51395, lng: 76.66043 },
    { id: 'H', name: 'Rockefeller Block', type: 'BUILDING', isMedicalCentre: false, lat: 30.51395, lng: 76.65982 },
    { id: 'I', name: 'Newton Block', type: 'BUILDING', isMedicalCentre: false, lat: 30.51644, lng: 76.65921 },
    { id: 'J', name: 'De Morgan Block', type: 'BUILDING', isMedicalCentre: false, lat: 30.51568, lng: 76.65951 },
    { id: 'K', name: 'Einstein Hall (Galileo Block)', type: 'BUILDING', isMedicalCentre: false, lat: 30.51584, lng: 76.66116 },
    { id: 'L', name: 'Pythagoras Block', type: 'BUILDING', isMedicalCentre: false, lat: 30.51507, lng: 76.65909 },
    { id: 'M', name: 'Galileo Block', type: 'BUILDING', isMedicalCentre: false, lat: 30.51580, lng: 76.66109 },
    { id: 'N', name: 'Park', type: 'PARK', isMedicalCentre: false, lat: 30.51725, lng: 76.65953 },
    { id: 'O', name: 'Hall', type: 'HALL', isMedicalCentre: false, lat: 30.51535, lng: 76.65941 },
    { id: 'P', name: 'Square 1 Food Court', type: 'FOOD_COURT', isMedicalCentre: false, lat: 30.51492, lng: 76.65981 },
    { id: 'Q', name: 'Boys Hostel', type: 'HOSTEL', isMedicalCentre: false, lat: 30.51365, lng: 76.66163 },
    { id: 'R', name: 'Exploratorium', type: 'FACILITY', isMedicalCentre: false, lat: 30.51580, lng: 76.65714 },
    { id: 'S', name: 'Sportorium', type: 'FACILITY', isMedicalCentre: false, lat: 30.51577, lng: 76.65811 },
    { id: 'T', name: 'Football Ground', type: 'FACILITY', isMedicalCentre: false, lat: 30.51668, lng: 76.65800 },
    { id: 'U', name: 'Volleyball Court', type: 'FACILITY', isMedicalCentre: false, lat: 30.51610, lng: 76.65866 },
    { id: 'V', name: 'Edison Block', type: 'BUILDING', isMedicalCentre: false, lat: 30.51645, lng: 76.66000 },
    { id: 'W', name: 'Fleming Block', type: 'BUILDING', isMedicalCentre: false, lat: 30.51570, lng: 76.66065 },
    { id: 'X', name: 'Admissions Block', type: 'BUILDING', isMedicalCentre: false, lat: 30.51773, lng: 76.65898 },
    { id: 'Y', name: 'T-point', type: 'JUNCTION', isMedicalCentre: false, lat: 30.51457, lng: 76.66045 }
  ];

  const CAMPUS_ROADS = [
    { id: 'R1', from: 'A', to: 'H', blocked: false },
    { id: 'R2', from: 'H', to: 'G', blocked: false },
    { id: 'R3', from: 'G', to: 'Q', blocked: false },
    { id: 'R6', from: 'M', to: 'K', blocked: false },
    { id: 'R7', from: 'K', to: 'E', blocked: false },
    { id: 'R8', from: 'E', to: 'D', blocked: false },
    { id: 'R9', from: 'D', to: 'F', blocked: false },
    { id: 'R10', from: 'D', to: 'N', blocked: false },
    { id: 'R11', from: 'N', to: 'I', blocked: false },
    { id: 'R12', from: 'I', to: 'J', blocked: false },
    { id: 'R13', from: 'J', to: 'O', blocked: false },
    { id: 'R14', from: 'O', to: 'P', blocked: false },
    { id: 'R15', from: 'P', to: 'L', blocked: false },
    { id: 'R16', from: 'L', to: 'A', blocked: false },
    { id: 'R17', from: 'D', to: 'C', blocked: false },
    { id: 'R18', from: 'C', to: 'X', blocked: false },
    { id: 'R19', from: 'E', to: 'V', blocked: false },
    { id: 'R20', from: 'E', to: 'W', blocked: false },
    { id: 'R21', from: 'L', to: 'U', blocked: false },
    { id: 'R22', from: 'U', to: 'T', blocked: false },
    { id: 'R23', from: 'T', to: 'S', blocked: false },
    { id: 'R24', from: 'S', to: 'R', blocked: false },
    { id: 'R25', from: 'C', to: 'E', blocked: false },
    { id: 'R26', from: 'V', to: 'I', blocked: false },
    { id: 'R27', from: 'B', to: 'Y', blocked: false },
    { id: 'R28', from: 'Y', to: 'G', blocked: false },
    { id: 'R29', from: 'Y', to: 'P', blocked: false },
    { id: 'R30', from: 'C', to: 'L', blocked: false }
  ];

  // State
  const state = {
    locations: [...CAMPUS_LOCATIONS],
    roads: [...CAMPUS_ROADS],
    closures: [],
    dispatches: [],
    activeRoute: null,
    selectedOrigin: null,
    selectedDest: null,
    isConnected: false,
    apiBase: detectApiBase(),
    selectedRoadForModal: null,
    isAnimating: false,
    map: null,
    roadLayer: null,
    routeLayer: null,
    markerLayer: null,
    vehicleMarker: null,
    routeGeometryRequest: 0,
    closureGeometryRequest: 0,
    routeGeometryPromise: Promise.resolve(null),
    activeRouteGeometry: null
  };

  function detectApiBase() {
    if (window.location.protocol.startsWith('http')) {
      return window.location.origin;
    }
    return 'http://localhost:8080';
  }

  // DOM Elements
  const el = {
    statusBadge: document.getElementById('backend-status-badge'),
    statusText: document.getElementById('backend-status-text'),
    refreshBtn: document.getElementById('refresh-data-btn'),
    statLocations: document.getElementById('top-stat-locations'),
    statRoads: document.getElementById('top-stat-roads'),
    statClosures: document.getElementById('top-stat-closures'),
    statDispatches: document.getElementById('top-stat-dispatches'),
    closureStatPill: document.getElementById('closure-stat-pill'),
    campusMap: document.getElementById('campus-map'),
    roadStatusSummary: document.getElementById('road-status-summary'),
    resetRouteBtn: document.getElementById('reset-route-btn'),
    routeForm: document.getElementById('route-form'),
    routeFrom: document.getElementById('route-from'),
    routeTo: document.getElementById('route-to'),
    swapLocationsBtn: document.getElementById('swap-locations-btn'),
    routeResultBox: document.getElementById('route-result-box'),
    resPathChips: document.getElementById('res-path-chips'),
    resSegments: document.getElementById('res-segments'),
    resEta: document.getElementById('res-eta'),
    resAlgoPill: document.getElementById('res-algo-pill'),
    dispatchForm: document.getElementById('dispatch-form'),
    dispatchLocation: document.getElementById('dispatch-location'),
    dispatchDesc: document.getElementById('dispatch-desc'),
    dispatchReceiptBox: document.getElementById('dispatch-receipt-box'),
    receiptId: document.getElementById('receipt-id'),
    receiptVehicle: document.getElementById('receipt-vehicle'),
    receiptIncident: document.getElementById('receipt-incident'),
    receiptRoute: document.getElementById('receipt-route'),
    receiptEta: document.getElementById('receipt-eta'),
    roadsTableBody: document.getElementById('roads-tbody'),
    closureList: document.getElementById('closure-list'),
    locSearch: document.getElementById('loc-search'),
    locationsTableBody: document.getElementById('locations-tbody'),
    historyTableBody: document.getElementById('history-tbody'),
    roadModal: document.getElementById('road-modal'),
    modalRoadId: document.getElementById('modal-road-id'),
    modalRoadEndpoints: document.getElementById('modal-road-endpoints'),
    modalRoadReason: document.getElementById('modal-road-reason'),
    roadCloseForm: document.getElementById('road-close-form'),
    dialogCloseBtn: document.getElementById('dialog-close-btn'),
    modalCancelBtn: document.getElementById('modal-cancel-btn'),
    toastContainer: document.getElementById('toast-container'),
    tabButtons: document.querySelectorAll('.cockpit-tab-btn'),
    tabPanels: document.querySelectorAll('.mode-panel')
  };

  // ========================================================
  // App Boot & Lifecycle
  // ========================================================

  async function boot() {
    bindNavigation();
    bindEvents();
    initCampusMap();
    renderMap();
    populateSelects();
    renderRoadsTable();
    renderLocationsTable();
    renderRoadStatusSummary();

    await syncWithBackend();
  }

  // ========================================================
  // Backend Communication & Auto-Sync
  // ========================================================

  async function syncWithBackend() {
    setBackendBadge('checking', 'Checking Java Backend...');
    try {
      const res = await fetch(`${state.apiBase}/api/status`, { mode: 'cors' });
      if (res.ok) {
        state.isConnected = true;
        setBackendBadge('connected', 'Java Backend Connected');
        await fetchRemoteData();
        return;
      }
    } catch (e) {
      if (state.apiBase !== 'http://localhost:8080') {
        try {
          const res = await fetch('http://localhost:8080/api/status', { mode: 'cors' });
          if (res.ok) {
            state.apiBase = 'http://localhost:8080';
            state.isConnected = true;
            setBackendBadge('connected', 'Java Backend :8080');
            await fetchRemoteData();
            return;
          }
        } catch (ignored) {}
      }
    }

    state.isConnected = false;
    setBackendBadge('standalone', 'Standalone Simulation Mode');
    updateMetricCounts();
  }

  function setBackendBadge(status, text) {
    el.statusBadge.className = `server-badge status-${status}`;
    el.statusText.textContent = text;
  }

  async function fetchRemoteData() {
    try {
      const [locsRes, roadsRes, sumRes, closuresRes, dispRes] = await Promise.all([
        fetch(`${state.apiBase}/api/locations`),
        fetch(`${state.apiBase}/api/roads`),
        fetch(`${state.apiBase}/api/summary`),
        fetch(`${state.apiBase}/api/closures`),
        fetch(`${state.apiBase}/api/dispatches`)
      ]);

      if (locsRes.ok) {
        const rawLocs = await locsRes.json();
        const coordMap = {};
        CAMPUS_LOCATIONS.forEach(location => { coordMap[location.id] = { lat: location.lat, lng: location.lng }; });
        state.locations = rawLocs.map(l => ({
          ...l,
          lat: Number.isFinite(Number(l.lat)) ? Number(l.lat) : (coordMap[l.id] ? coordMap[l.id].lat : 30.5163),
          lng: Number.isFinite(Number(l.lng)) ? Number(l.lng) : (coordMap[l.id] ? coordMap[l.id].lng : 76.6601)
        }));
      }

      if (roadsRes.ok) state.roads = await roadsRes.json();
      if (closuresRes.ok) state.closures = await closuresRes.json();
      if (dispRes.ok) state.dispatches = await dispRes.json();

      updateMetricCounts();
      renderMap();
      renderRoadsTable();
      renderLocationsTable();
      renderRoadStatusSummary();
      renderClosureFeed();
      renderDispatchHistory();
    } catch (err) {
      console.warn('Backend query error, using local state:', err);
    }
  }

  function updateMetricCounts() {
    el.statLocations.textContent = state.locations.length;
    const blockedCount = state.roads.filter(r => r.blocked).length;
    const openCount = state.roads.length - blockedCount;
    el.statRoads.textContent = `${openCount}/${state.roads.length}`;
    el.statClosures.textContent = blockedCount;
    el.statDispatches.textContent = state.dispatches.length;

    if (blockedCount > 0) {
      el.closureStatPill.classList.add('has-closures');
    } else {
      el.closureStatPill.classList.remove('has-closures');
    }
  }

  // ========================================================
  // Leaflet campus map with approximate graph overlay
  // ========================================================

  function initCampusMap() {
    if (!window.L || !el.campusMap) {
      el.campusMap.innerHTML = '<div class="map-load-error">Map library could not load. Check your internet connection and reload.</div>';
      return;
    }
    state.map = L.map(el.campusMap, { zoomControl: false }).setView([30.5163, 76.6601], 18);
    L.control.zoom({ position: 'bottomright' }).addTo(state.map);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(state.map);
    state.roadLayer = L.layerGroup().addTo(state.map);
    state.routeLayer = L.layerGroup().addTo(state.map);
    state.markerLayer = L.layerGroup().addTo(state.map);
    state.map.fitBounds(CAMPUS_LOCATIONS.map(location => [location.lat, location.lng]), { padding: [90, 90], maxZoom: 17.5 });
    requestAnimationFrame(() => state.map.invalidateSize());
  }

  function renderMap() {
    if (!state.map) return;
    state.routeGeometryRequest += 1;
    state.closureGeometryRequest += 1;
    state.activeRouteGeometry = null;
    state.roadLayer.clearLayers();
    state.routeLayer.clearLayers();
    state.markerLayer.clearLayers();
    drawClosedRoads();
    drawNodes();
    if (state.activeRoute) drawActivePath(state.activeRoute.path);
  }

  // The OSM tile layer supplies the actual mapped roads. Graph edges are used
  // by BFS; closed links are drawn in red using road-matched geometry.

  function drawClosedRoads() {
    const closedRoads = state.roads.filter(road => road.blocked);
    if (!closedRoads.length) return;
    const requestId = state.closureGeometryRequest;
    const locMap = getLocationsMap();
    Promise.all(closedRoads.map(async road => {
      const from = locMap[road.from], to = locMap[road.to];
      if (!from || !to) return;
      const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
      const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`;
      const route = await fetchOpenStreetMapRoute(url);
      if (!route || requestId !== state.closureGeometryRequest) return;
      L.polyline(route.points, { color: '#ef4444', weight: 7, opacity: 0.95, lineCap: 'round', lineJoin: 'round', interactive: true })
        .bindTooltip(`Closed road ${road.id}`)
        .addTo(state.roadLayer);
    }));
  }

  function drawNodes() {
    state.locations.forEach(loc => {
      const isOrigin = state.selectedOrigin === loc.id;
      const isDest = state.selectedDest === loc.id;
      const isHospital = loc.id === 'F' || loc.isMedicalCentre;
      const classes = ['campus-pin'];
      if (isOrigin) classes.push('is-origin');
      if (isDest) classes.push('is-dest');
      if (isHospital) classes.push('is-medical');
      const label = `<span class="campus-pin-dot">${escapeHtml(loc.id)}</span>`;
      const marker = L.marker([loc.lat, loc.lng], {
        keyboard: true,
        title: `${loc.name} (${loc.id})`,
        icon: L.divIcon({ className: 'offtrack-node-icon', html: `<span class="${classes.join(' ')}">${label}</span>`, iconSize: [32, 32], iconAnchor: [16, 16] })
      }).addTo(state.markerLayer);
      marker.bindTooltip(`${escapeHtml(loc.name)} (${escapeHtml(loc.id)})`, { direction: 'top', offset: [0, -12] });
      marker.on('click', () => handleNodeClick(loc));
    });
  }

  function handleNodeClick(loc) {
    if (!state.selectedOrigin) {
      state.selectedOrigin = loc.id;
      el.routeFrom.value = loc.id;
      el.dispatchLocation.value = loc.id;
      toast(`Selected ${loc.name} (${loc.id}) as Start Point`, 'info');
    } else if (state.selectedOrigin === loc.id) {
      state.selectedOrigin = null;
      el.routeFrom.value = '';
    } else {
      state.selectedDest = loc.id;
      el.routeTo.value = loc.id;
      toast(`Selected ${loc.name} (${loc.id}) as Destination`, 'info');
      calculateRoute(state.selectedOrigin, state.selectedDest);
    }
    renderMap();
  }

  function toggleRoadStatePrompt(road) {
    if (road.blocked) {
      if (confirm(`Road ${road.id} (${road.from} <-> ${road.to}) is currently closed. Reopen this road segment?`)) {
        reopenRoad(road.id);
      }
    } else {
      state.selectedRoadForModal = road;
      el.modalRoadId.textContent = road.id;
      el.modalRoadEndpoints.textContent = `${road.from} <-> ${road.to}`;
      el.modalRoadReason.value = 'Road obstruction / Maintenance';
      el.roadModal.showModal();
    }
  }

  // ========================================================
  // Graph route overlay and dispatch vehicle animation
  // ========================================================

  function usesJunctionPath(path, locationsById) {
    return path.length === 3 && locationsById[path[1]]?.type === 'JUNCTION';
  }

  function drawActivePath(path) {
    if (!state.map || !path || path.length < 2) return;
    const locMap = getLocationsMap();
    const locations = path.map(id => locMap[id]).filter(Boolean);
    const hasClosures = state.roads.some(road => road.blocked);
    const hasJunctionStop = usesJunctionPath(path, locMap);
    // Map through actual junctions when BFS selects one; otherwise route directly
    // between the selected places so unrelated buildings are not forced stops.
    const routeStops = hasClosures || hasJunctionStop ? locations : [locations[0], locations[locations.length - 1]];
    const points = routeStops.map(loc => [loc.lat, loc.lng]);
    if (points.length < 2) return;

    const requestId = state.routeGeometryRequest;
    const routeSignature = path.join('|');
    const coordinatePath = routeStops.map(loc => `${loc.lng},${loc.lat}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coordinatePath}?overview=full&geometries=geojson&steps=false`;

    state.routeGeometryPromise = fetchOpenStreetMapRoute(url).then(route => {
      if (!route || requestId !== state.routeGeometryRequest || !state.activeRoute || state.activeRoute.path.join('|') !== routeSignature) return null;
      state.activeRouteGeometry = route.points;
      state.routeLayer.clearLayers();
      L.polyline(route.points, { color: '#00c9d8', weight: 7, opacity: 0.96, lineCap: 'round', lineJoin: 'round', interactive: false }).addTo(state.routeLayer);
      el.resSegments.textContent = route.distanceMeters >= 1000
        ? `${(route.distanceMeters / 1000).toFixed(1)} km`
        : `${Math.round(route.distanceMeters)} m`;
      el.resEta.textContent = `${Math.max(1, Math.ceil(route.durationSeconds / 60))} min`;
      return route.points;
    }).catch(() => null);
  }

  async function fetchOpenStreetMapRoute(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) return null;
      const data = await response.json();
      const routedPath = data.routes?.[0];
      const coordinates = routedPath?.geometry?.coordinates;
      if (data.code !== 'Ok' || !Array.isArray(coordinates) || coordinates.length < 2) return null;
      return {
        points: coordinates
          .filter(pair => Array.isArray(pair) && Number.isFinite(pair[0]) && Number.isFinite(pair[1]))
          .map(([lng, lat]) => [lat, lng]),
        distanceMeters: routedPath.distance,
        durationSeconds: routedPath.duration
      };
    } catch (error) {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  async function simulateAmbulanceAlongPath(path) {
    if (!state.map || !path || path.length < 2 || state.isAnimating) return;
    state.isAnimating = true;
    const locMap = getLocationsMap();
    const roadPoints = await state.routeGeometryPromise;
    if (!roadPoints || roadPoints.length < 2) {
      state.isAnimating = false;
      toast('Mapped road route is unavailable. Try again when the map service is online.', 'emergency');
      return;
    }
    const points = roadPoints;
    const vehicleIcon = L.divIcon({ className: 'ambulance-icon-wrap', html: '<span class="ambulance-icon">+</span>', iconSize: [34, 34], iconAnchor: [17, 17] });
    state.vehicleMarker = L.marker(points[0], { icon: vehicleIcon, interactive: false, zIndexOffset: 1000 }).addTo(state.map);
    let segment = 0;
    const segmentDuration = 250;
    function animateHop() {
      if (segment >= points.length - 1) {
        state.isAnimating = false;
        toast('Ambulance reached facility destination safely!', 'success');
        setTimeout(() => { if (state.vehicleMarker) state.vehicleMarker.remove(); state.vehicleMarker = null; }, 2200);
        return;
      }
      const a = points[segment], b = points[segment + 1];
      const started = performance.now();
      function step(now) {
        const t = Math.min(1, (now - started) / segmentDuration);
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        state.vehicleMarker.setLatLng([a[0] + (b[0] - a[0]) * eased, a[1] + (b[1] - a[1]) * eased]);
        if (t < 1) requestAnimationFrame(step);
        else { segment++; animateHop(); }
      }
      requestAnimationFrame(step);
    }
    animateHop();
  }

  // ========================================================
  // Routing Engine (API + Client Fallback)
  // ========================================================

  async function calculateRoute(from, to, algo = 'bfs') {
    if (!from || !to) return;
    toast(`Computing ${algo.toUpperCase()} path...`, 'info');

    let resData;
    if (state.isConnected) {
      try {
        const res = await fetch(`${state.apiBase}/api/route`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ from, to, algorithm: algo })
        });
        resData = await res.json();
      } catch (e) {
        resData = localGraphSearch(from, to, algo === 'dfs');
      }
    } else {
      resData = localGraphSearch(from, to, algo === 'dfs');
    }

    if (resData.found) {
      const locMap = getLocationsMap();
      const hasClosures = state.roads.some(road => road.blocked);
      const hasJunctionStop = usesJunctionPath(resData.path, locMap);
      if (!hasClosures && !hasJunctionStop) {
        // BFS confirms the campus graph is connected; OSRM supplies the actual
        // shortest mapped road from the selected origin directly to destination.
        resData.path = [from, to];
        resData.roadSegments = null;
        resData.travelTimeMinutes = null;
      }
      state.activeRoute = resData;
      state.selectedOrigin = from;
      state.selectedDest = to;

      renderMap();

      // Update Side Results
      el.routeResultBox.classList.remove('hidden');
      el.resAlgoPill.textContent = resData.algorithm;
      el.resSegments.textContent = resData.roadSegments ?? '—';
      el.resEta.textContent = resData.travelTimeMinutes == null ? '—' : `${resData.travelTimeMinutes} min`;

      // Render Path Chips
      el.resPathChips.innerHTML = '';
      resData.path.forEach((nodeId, idx) => {
        const nodeLoc = locMap[nodeId];
        const chip = document.createElement('span');
        chip.className = 'path-node-chip';
        chip.textContent = `${nodeId} (${nodeLoc ? nodeLoc.name : nodeId})`;
        el.resPathChips.appendChild(chip);

        if (idx < resData.path.length - 1) {
          const arrow = document.createElement('span');
          arrow.className = 'path-arrow';
          arrow.innerHTML = '&rarr;';
          el.resPathChips.appendChild(arrow);
        }
      });


      toast(`Optimal Route Found: ${resData.path.join(' ➔ ')}`, 'success');
    } else {
      toast(resData.error || 'No open route found.', 'emergency');
      el.routeResultBox.classList.add('hidden');
      state.activeRoute = null;
      renderMap();
    }
  }

  function localGraphSearch(fromId, toId, useDfs) {
    const adj = {};
    state.locations.forEach(l => { adj[l.id] = []; });

    state.roads.forEach(r => {
      if (!r.blocked) {
        if (!adj[r.from]) adj[r.from] = [];
        if (!adj[r.to]) adj[r.to] = [];
        adj[r.from].push(r.to);
        adj[r.to].push(r.from);
      }
    });

    if (useDfs) {
      const visited = new Set();
      const path = [];
      let found = false;

      function dfs(curr) {
        visited.add(curr);
        path.push(curr);
        if (curr === toId) {
          found = true;
          return;
        }
        for (const next of adj[curr] || []) {
          if (!visited.has(next)) {
            dfs(next);
            if (found) return;
          }
        }
        path.pop();
      }

      dfs(fromId);
      if (found) {
        return {
          found: true,
          path,
          roadSegments: path.length - 1,
          travelTimeMinutes: (path.length - 1) * 2,
          algorithm: 'DFS'
        };
      }
    } else {
      const queue = [[fromId]];
      const visited = new Set([fromId]);

      while (queue.length > 0) {
        const currPath = queue.shift();
        const currNode = currPath[currPath.length - 1];

        if (currNode === toId) {
          return {
            found: true,
            path: currPath,
            roadSegments: currPath.length - 1,
            travelTimeMinutes: (currPath.length - 1) * 2,
            algorithm: 'BFS'
          };
        }

        for (const next of adj[currNode] || []) {
          if (!visited.has(next)) {
            visited.add(next);
            queue.push([...currPath, next]);
          }
        }
      }
    }

    return { found: false, error: 'No route available with the current blocked roads.' };
  }

  // ========================================================
  // Emergency Ambulance Dispatch
  // ========================================================

  async function dispatchAmbulance(locationId, description, priority) {
    toast(`Dispatching ambulance to location ${locationId}...`, 'emergency');

    let receipt;
    if (state.isConnected) {
      try {
        const res = await fetch(`${state.apiBase}/api/dispatch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locationId, description, priority })
        });
        receipt = await res.json();
      } catch (e) {
        receipt = localDispatchFallback(locationId, description, priority);
      }
    } else {
      receipt = localDispatchFallback(locationId, description, priority);
    }

    if (receipt && receipt.success) {
      state.dispatches.unshift(receipt);
      state.activeRoute = {
        path: receipt.path,
        roadSegments: receipt.segments,
        travelTimeMinutes: receipt.etaMinutes,
        algorithm: 'BFS'
      };
      state.selectedOrigin = locationId;
      state.selectedDest = 'F';

      // Update Modern Receipt Card
      el.dispatchReceiptBox.classList.remove('hidden');
      el.receiptId.textContent = receipt.id;
      el.receiptVehicle.textContent = receipt.vehicle;
      el.receiptIncident.textContent = `${receipt.description} (${receipt.incidentLocation})`;
      el.receiptRoute.textContent = receipt.path.join(' ➔ ');
      el.receiptEta.textContent = `${receipt.etaMinutes} minutes`;

      renderMap();
      renderDispatchHistory();
      updateMetricCounts();

      // Trigger automatic vehicle animation
      simulateAmbulanceAlongPath(receipt.path);
      toast(`Unit Dispatched: ${receipt.id} (${receipt.vehicle})`, 'emergency');
    } else {
      toast(receipt.error || 'Failed to dispatch ambulance.', 'emergency');
    }
  }

  function localDispatchFallback(locationId, description, priority) {
    const route = localGraphSearch(locationId, 'F', false);
    if (!route.found) {
      return { success: false, error: 'No open pathway to Neelam Hospital!' };
    }
    const id = `DSP-${String(state.dispatches.length + 1).padStart(3, '0')}`;
    return {
      success: true,
      id: id,
      status: 'DISPATCHED',
      vehicle: 'Ambulance AMB-01',
      priority: priority,
      incidentLocation: locationId,
      destination: 'F',
      description: description,
      path: route.path,
      segments: route.roadSegments,
      etaMinutes: route.travelTimeMinutes
    };
  }

  // ========================================================
  // Road Closures & Reopening
  // ========================================================

  async function closeRoad(roadId, reason) {
    if (state.isConnected) {
      try {
        await fetch(`${state.apiBase}/api/closures/close`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roadId, reason })
        });
      } catch (ignored) {}
    }

    const road = state.roads.find(r => r.id === roadId);
    if (road) road.blocked = true;
    state.closures.push({
      roadId,
      reason,
      reportedAt: new Date().toLocaleTimeString()
    });

    renderMap();
    renderRoadsTable();
    renderRoadStatusSummary();
    renderClosureFeed();
    updateMetricCounts();
    toast(`Road ${roadId} closed: ${reason}`, 'emergency');

    if (state.activeRoute) {
      calculateRoute(state.selectedOrigin, state.selectedDest, state.activeRoute.algorithm.toLowerCase());
    }
  }

  async function reopenRoad(roadId) {
    if (state.isConnected) {
      try {
        await fetch(`${state.apiBase}/api/closures/reopen`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roadId })
        });
      } catch (ignored) {}
    }

    const road = state.roads.find(r => r.id === roadId);
    if (road) road.blocked = false;
    state.closures = state.closures.filter(c => c.roadId !== roadId);

    renderMap();
    renderRoadsTable();
    renderRoadStatusSummary();
    renderClosureFeed();
    updateMetricCounts();
    toast(`Road ${roadId} reopened for traffic`, 'success');

    if (state.activeRoute) {
      calculateRoute(state.selectedOrigin, state.selectedDest, state.activeRoute.algorithm.toLowerCase());
    }
  }

  // ========================================================
  // Cockpit Table & UI Renderers
  // ========================================================

  function populateSelects() {
    el.routeFrom.innerHTML = '<option value="">Select origin point...</option>';
    el.routeTo.innerHTML = '<option value="">Select destination point...</option>';
    el.dispatchLocation.innerHTML = '<option value="">Select incident location...</option>';

    state.locations.forEach(l => {
      const o1 = new Option(`${l.id} - ${l.name}`, l.id);
      const o2 = new Option(`${l.id} - ${l.name}`, l.id);
      const o3 = new Option(`${l.id} - ${l.name}`, l.id);
      el.routeFrom.add(o1);
      el.routeTo.add(o2);
      el.dispatchLocation.add(o3);
    });
  }

  function renderRoadsTable() {
    el.roadsTableBody.innerHTML = '';
    state.roads.forEach(road => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <th scope="row"><strong class="font-mono">${road.id}</strong></th>
        <td>${road.from} &harr; ${road.to}</td>
        <td>
          <span class="${road.blocked ? 'status-badge-blocked' : 'status-badge-open'}">
            ${road.blocked ? 'BLOCKED' : 'OPEN'}
          </span>
        </td>
        <td>
          <button type="button" class="table-action-btn ${road.blocked ? 'btn-reopen' : ''}" data-road="${road.id}">
            ${road.blocked ? 'Reopen' : 'Block'}
          </button>
        </td>
      `;
      tr.querySelector('button').addEventListener('click', () => {
        if (road.blocked) {
          reopenRoad(road.id);
        } else {
          toggleRoadStatePrompt(road);
        }
      });
      el.roadsTableBody.appendChild(tr);
    });
  }

  function renderRoadStatusSummary() {
    if (!el.roadStatusSummary) return;
    const blocked = state.roads.filter(road => road.blocked).length;
    const open = state.roads.length - blocked;
    el.roadStatusSummary.textContent = `${open} of ${state.roads.length} sample links open${blocked ? ` · ${blocked} closed` : ''}`;
  }

  function renderLocationsTable(filter = '') {
    el.locationsTableBody.innerHTML = '';
    const q = filter.toLowerCase().trim();
    const filtered = state.locations.filter(l => l.id.toLowerCase().includes(q) || l.name.toLowerCase().includes(q));

    if (filtered.length === 0) {
      el.locationsTableBody.innerHTML = '<tr class="empty-row"><td colspan="4">No campus nodes match search.</td></tr>';
      return;
    }

    filtered.forEach(l => {
      const connections = state.roads
        .filter(r => r.from === l.id || r.to === l.id)
        .map(r => r.id)
        .join(', ');

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <th scope="row"><span class="font-mono text-cyan">${l.id}</span></th>
        <td><strong>${escapeHtml(l.name)}</strong> ${l.isMedicalCentre ? '<span class="status-badge-blocked">MEDICAL</span>' : ''}</td>
        <td><span class="text-dim">${l.type}</span></td>
        <td class="font-mono text-dim">${connections}</td>
      `;
      el.locationsTableBody.appendChild(tr);
    });
  }

  function renderClosureFeed() {
    el.closureList.innerHTML = '';
    if (state.closures.length === 0) {
      el.closureList.innerHTML = `<li class="feed-empty">No active road closures. All ${state.roads.length} road segments operational.</li>`;
      return;
    }

    state.closures.forEach(c => {
      const li = document.createElement('li');
      li.className = 'closure-card';
      li.innerHTML = `
        <div>
          <strong class="font-mono text-red">ROAD ${escapeHtml(c.roadId)}</strong> &bull; <span>${escapeHtml(c.reason)}</span>
        </div>
        <span class="closure-time">${escapeHtml(c.reportedAt || 'Active')}</span>
      `;
      el.closureList.appendChild(li);
    });
  }

  function renderDispatchHistory() {
    el.historyTableBody.innerHTML = '';
    if (state.dispatches.length === 0) {
      el.historyTableBody.innerHTML = '<tr class="empty-row"><td colspan="5">No dispatches logged in this session.</td></tr>';
      return;
    }

    state.dispatches.forEach(d => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <th scope="row" class="font-mono"><strong>${escapeHtml(d.id)}</strong></th>
        <td><span class="status-badge-${d.priority === 'CRITICAL' ? 'blocked' : 'open'}">${d.priority}</span></td>
        <td>${escapeHtml(d.incidentLocation)}</td>
        <td>${escapeHtml(d.description)}</td>
        <td class="font-mono text-cyan">${escapeHtml(d.etaMinutes)} min</td>
      `;
      el.historyTableBody.appendChild(tr);
    });
  }

  function getLocationsMap() {
    const map = {};
    state.locations.forEach(l => { map[l.id] = l; });
    return map;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
  }

  // ========================================================
  // UI Bindings & Event Wireup
  // ========================================================

  function bindNavigation() {
    el.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        el.tabButtons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        el.tabPanels.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        el.tabButtons.forEach(tab => { tab.tabIndex = tab === btn ? 0 : -1; });
        const target = document.getElementById(btn.getAttribute('aria-controls'));
        if (target) target.classList.add('active');
      });
      btn.addEventListener('keydown', event => {
        if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const tabs = Array.from(el.tabButtons);
        const current = tabs.indexOf(btn);
        const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1
          : (current + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
        tabs[nextIndex].focus();
        tabs[nextIndex].click();
      });
    });
  }

  el.tabButtons.forEach((tab, index) => { tab.tabIndex = index === 0 ? 0 : -1; });

  function bindEvents() {
    // Route Form
    el.routeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const from = el.routeFrom.value;
      const to = el.routeTo.value;
      const algo = 'bfs';
      if (from === to) {
        toast('Origin and destination cannot be identical!', 'emergency');
        return;
      }
      calculateRoute(from, to, algo);
    });

    // Swap Locations
    el.swapLocationsBtn.addEventListener('click', () => {
      const temp = el.routeFrom.value;
      el.routeFrom.value = el.routeTo.value;
      el.routeTo.value = temp;
      if (el.routeFrom.value && el.routeTo.value) {
        calculateRoute(el.routeFrom.value, el.routeTo.value);
      }
    });

    // Emergency Dispatch Form
    el.dispatchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const loc = el.dispatchLocation.value;
      const desc = el.dispatchDesc.value;
      const prio = el.dispatchForm.elements['priority'].value;
      dispatchAmbulance(loc, desc, prio);
    });

    // Refresh Sync
    el.refreshBtn.addEventListener('click', () => {
      syncWithBackend();
      toast('Refreshed status & synced topology', 'info');
    });

    // Reset Route
    el.resetRouteBtn.addEventListener('click', () => {
      state.activeRoute = null;
      state.selectedOrigin = null;
      state.selectedDest = null;
      el.routeResultBox.classList.add('hidden');
      el.routeFrom.value = '';
      el.routeTo.value = '';
      renderMap();
    });

    // Search input
    el.locSearch.addEventListener('input', (e) => {
      renderLocationsTable(e.target.value);
    });

    // Dialog Buttons
    el.dialogCloseBtn.addEventListener('click', () => el.roadModal.close());
    el.modalCancelBtn.addEventListener('click', () => el.roadModal.close());

    // Dialog Submit
    el.roadCloseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const reason = el.modalRoadReason.value || 'Obstacle reported';
      if (state.selectedRoadForModal) {
        closeRoad(state.selectedRoadForModal.id, reason);
      }
      el.roadModal.close();
    });
  }

  function toast(msg, type = 'info') {
    const t = document.createElement('div');
    t.className = `toast-item toast-${type}`;
    t.textContent = msg;
    el.toastContainer.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateY(10px)';
      t.style.transition = '0.2s ease';
      setTimeout(() => t.remove(), 200);
    }, 3200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
