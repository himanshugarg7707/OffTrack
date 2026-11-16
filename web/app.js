/**
 * OffTrack - Enterprise Emergency Navigation & Dispatch Controller
 * Modern Cockpit Dashboard with Live Java REST API Sync & Full Offline Engine
 */

(function () {
  'use strict';

  // 1. Campus Geography & Blueprint Coordinates (1000x600 canvas)
  const CAMPUS_LOCATIONS = [
    { id: 'A', name: 'Main Gate', type: 'GATE', isMedicalCentre: false, x: 140, y: 440 },
    { id: 'B', name: 'Hostel Road', type: 'HOSTEL', isMedicalCentre: false, x: 240, y: 190 },
    { id: 'C', name: 'Academic Block', type: 'BUILDING', isMedicalCentre: false, x: 480, y: 440 },
    { id: 'D', name: 'Library', type: 'BUILDING', isMedicalCentre: false, x: 520, y: 190 },
    { id: 'E', name: 'Sports Complex', type: 'FACILITY', isMedicalCentre: false, x: 820, y: 440 },
    { id: 'F', name: 'Campus Medical Centre', type: 'MEDICAL_CENTRE', isMedicalCentre: true, x: 830, y: 180 }
  ];

  const CAMPUS_ROADS = [
    { id: 'R1', from: 'A', to: 'B', blocked: false },
    { id: 'R2', from: 'A', to: 'C', blocked: false },
    { id: 'R3', from: 'B', to: 'D', blocked: false },
    { id: 'R4', from: 'C', to: 'D', blocked: false },
    { id: 'R5', from: 'C', to: 'E', blocked: false },
    { id: 'R6', from: 'D', to: 'F', blocked: false },
    { id: 'R7', from: 'E', to: 'F', blocked: false },
    { id: 'R8', from: 'B', to: 'C', blocked: false }
  ];

  // SVG Glyphs for clean vector node graphics (Zero emojis)
  const NODE_GLYPHS = {
    GATE: '<path d="M4 21V10l8-6 8 6v11M10 21v-7h4v7" fill="none" stroke="#ffffff" stroke-width="2"/>',
    HOSTEL: '<rect x="4" y="3" width="16" height="18" rx="2" fill="none" stroke="#ffffff" stroke-width="2"/><line x1="9" y1="8" x2="9" y2="8.01" stroke="#ffffff" stroke-width="2.5"/><line x1="15" y1="8" x2="15" y2="8.01" stroke="#ffffff" stroke-width="2.5"/><line x1="9" y1="12" x2="9" y2="12.01" stroke="#ffffff" stroke-width="2.5"/><line x1="15" y1="12" x2="15" y2="12.01" stroke="#ffffff" stroke-width="2.5"/><line x1="11" y1="17" x2="13" y2="17" stroke="#ffffff" stroke-width="2"/>',
    BUILDING: '<path d="M3 21h18M6 21V8l6-4 6 4v13M10 12h4M10 16h4" fill="none" stroke="#ffffff" stroke-width="2"/>',
    FACILITY: '<circle cx="12" cy="12" r="9" fill="none" stroke="#ffffff" stroke-width="2"/><path d="M12 3a9 9 0 0 1 0 18M3 12a9 9 0 0 1 18 0" fill="none" stroke="#ffffff" stroke-width="1.5"/>',
    MEDICAL_CENTRE: '<rect x="8" y="4" width="8" height="16" rx="2" fill="#ef4444"/><rect x="4" y="8" width="16" height="8" rx="2" fill="#ef4444"/><rect x="9.5" y="6" width="5" height="12" fill="#ffffff"/><rect x="6" y="9.5" width="12" height="5" fill="#ffffff"/>'
  };

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
    isAnimating: false
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
    roadsLayer: document.getElementById('roads-layer'),
    activePathLayer: document.getElementById('active-path-layer'),
    roadTagsLayer: document.getElementById('road-tags-layer'),
    nodesLayer: document.getElementById('nodes-layer'),
    vehicleLayer: document.getElementById('vehicle-layer'),
    routeHudBanner: document.getElementById('route-hud-banner'),
    bannerAlgoBadge: document.getElementById('banner-algo-badge'),
    bannerPathText: document.getElementById('banner-path-text'),
    bannerMetaText: document.getElementById('banner-meta-text'),
    animateAmbulanceBtn: document.getElementById('animate-ambulance-btn'),
    resetRouteBtn: document.getElementById('reset-route-btn'),
    quickRoadsStrip: document.getElementById('quick-roads-strip'),
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
    renderMap();
    populateSelects();
    renderRoadsTable();
    renderLocationsTable();
    renderQuickRoadsStrip();

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
        // Merge layout coordinates
        const coordMap = {};
        CAMPUS_LOCATIONS.forEach(c => { coordMap[c.id] = { x: c.x, y: c.y }; });
        state.locations = rawLocs.map(l => ({
          ...l,
          x: coordMap[l.id] ? coordMap[l.id].x : 300,
          y: coordMap[l.id] ? coordMap[l.id].y : 300
        }));
      }

      if (roadsRes.ok) state.roads = await roadsRes.json();
      if (closuresRes.ok) state.closures = await closuresRes.json();
      if (dispRes.ok) state.dispatches = await dispRes.json();

      updateMetricCounts();
      renderMap();
      renderRoadsTable();
      renderLocationsTable();
      renderQuickRoadsStrip();
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
  // High-Definition SVG Map Engine
  // ========================================================

  function renderMap() {
    drawRoads();
    drawRoadShields();
    drawNodes();
    if (state.activeRoute) {
      drawActivePath(state.activeRoute.path);
    }
  }

  function drawRoads() {
    el.roadsLayer.innerHTML = '';
    const locMap = getLocationsMap();

    state.roads.forEach(road => {
      const p1 = locMap[road.from];
      const p2 = locMap[road.to];
      if (!p1 || !p2) return;

      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('class', `road-group ${road.blocked ? 'blocked' : ''}`);

      // Casing / Shoulder
      const casing = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      casing.setAttribute('x1', p1.x);
      casing.setAttribute('y1', p1.y);
      casing.setAttribute('x2', p2.x);
      casing.setAttribute('y2', p2.y);
      casing.setAttribute('class', 'svg-road-casing');

      // Surface
      const surface = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      surface.setAttribute('x1', p1.x);
      surface.setAttribute('y1', p1.y);
      surface.setAttribute('x2', p2.x);
      surface.setAttribute('y2', p2.y);
      surface.setAttribute('class', 'svg-road-surface');
      surface.addEventListener('click', () => toggleRoadStatePrompt(road));

      // Centerline
      const centerline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      centerline.setAttribute('x1', p1.x);
      centerline.setAttribute('y1', p1.y);
      centerline.setAttribute('x2', p2.x);
      centerline.setAttribute('y2', p2.y);
      centerline.setAttribute('class', 'svg-road-centerline');

      group.appendChild(casing);
      group.appendChild(surface);
      group.appendChild(centerline);
      el.roadsLayer.appendChild(group);
    });
  }

  function drawRoadShields() {
    el.roadTagsLayer.innerHTML = '';
    const locMap = getLocationsMap();

    state.roads.forEach(road => {
      const p1 = locMap[road.from];
      const p2 = locMap[road.to];
      if (!p1 || !p2) return;

      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', `road-shield-group ${road.blocked ? 'blocked' : ''}`);
      g.setAttribute('transform', `translate(${midX}, ${midY})`);
      g.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleRoadStatePrompt(road);
      });

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', -16);
      rect.setAttribute('y', -9);
      rect.setAttribute('width', 32);
      rect.setAttribute('height', 18);
      rect.setAttribute('class', 'road-shield-bg');

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('class', 'road-shield-text');
      text.textContent = road.blocked ? 'STOP' : road.id;

      g.appendChild(rect);
      g.appendChild(text);
      el.roadTagsLayer.appendChild(g);
    });
  }

  function drawNodes() {
    el.nodesLayer.innerHTML = '';

    state.locations.forEach(loc => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const isOrigin = state.selectedOrigin === loc.id;
      const isDest = state.selectedDest === loc.id;
      const isHospital = loc.id === 'F' || loc.isMedicalCentre;

      let cls = 'svg-node';
      if (isOrigin) cls += ' is-origin';
      if (isDest) cls += ' is-dest';
      if (isHospital) cls += ' is-hospital';
      g.setAttribute('class', cls);
      g.setAttribute('transform', `translate(${loc.x}, ${loc.y})`);

      // Radar Pulse for Hospital
      if (isHospital) {
        const radar = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        radar.setAttribute('class', 'hospital-radar');
        radar.setAttribute('r', 24);
        g.appendChild(radar);
      }

      // Base Circle
      const base = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      base.setAttribute('class', 'node-base-circle');
      base.setAttribute('r', 22);

      // Icon Glyph
      const iconGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      iconGroup.setAttribute('transform', 'translate(-12, -12)');
      iconGroup.innerHTML = NODE_GLYPHS[loc.type] || NODE_GLYPHS.BUILDING;

      // Bottom Label Pill
      const pillW = Math.max(88, loc.name.length * 7.5);
      const pillH = 22;
      const pillY = 32;

      const pillBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      pillBg.setAttribute('x', -pillW / 2);
      pillBg.setAttribute('y', pillY);
      pillBg.setAttribute('width', pillW);
      pillBg.setAttribute('height', pillH);
      pillBg.setAttribute('class', 'node-label-pill');

      const pillText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      pillText.setAttribute('x', 0);
      pillText.setAttribute('y', pillY + 11);
      pillText.setAttribute('class', 'node-label-text');
      pillText.textContent = `${loc.id} &bull; ${loc.name}`;
      pillText.innerHTML = `<tspan class="node-id-badge">${loc.id}</tspan> &nbsp;${loc.name}`;

      g.appendChild(base);
      g.appendChild(iconGroup);
      g.appendChild(pillBg);
      g.appendChild(pillText);

      g.addEventListener('click', () => handleNodeClick(loc));
      el.nodesLayer.appendChild(g);
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
  // Active Route Drawing & Ambulance Simulation
  // ========================================================

  function drawActivePath(path) {
    el.activePathLayer.innerHTML = '';
    if (!path || path.length < 2) return;

    const locMap = getLocationsMap();
    let d = '';

    for (let i = 0; i < path.length; i++) {
      const loc = locMap[path[i]];
      if (!loc) continue;
      d += (i === 0 ? `M ${loc.x} ${loc.y}` : ` L ${loc.x} ${loc.y}`);
    }

    const pathLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathLine.setAttribute('d', d);
    pathLine.setAttribute('class', 'svg-active-glow');
    el.activePathLayer.appendChild(pathLine);
  }

  function simulateAmbulanceAlongPath(path) {
    if (!path || path.length < 2 || state.isAnimating) return;
    state.isAnimating = true;

    const locMap = getLocationsMap();
    const vehicle = el.vehicleLayer;
    vehicle.style.display = 'block';

    let currentSegment = 0;
    const segmentDuration = 700; // ms per hop

    function animateHop() {
      if (currentSegment >= path.length - 1) {
        state.isAnimating = false;
        toast('Ambulance reached facility destination safely!', 'success');
        setTimeout(() => { vehicle.style.display = 'none'; }, 2200);
        return;
      }

      const p1 = locMap[path[currentSegment]];
      const p2 = locMap[path[currentSegment + 1]];
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
      const startTime = performance.now();

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / segmentDuration);
        const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

        const curX = p1.x + (p2.x - p1.x) * ease;
        const curY = p1.y + (p2.y - p1.y) * ease;

        vehicle.setAttribute('transform', `translate(${curX}, ${curY}) rotate(${angle})`);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          currentSegment++;
          animateHop();
        }
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
      state.activeRoute = resData;
      state.selectedOrigin = from;
      state.selectedDest = to;

      drawActivePath(resData.path);
      renderMap();

      // Update Side Results
      el.routeResultBox.classList.remove('hidden');
      el.resAlgoPill.textContent = resData.algorithm;
      el.resSegments.textContent = resData.roadSegments;
      el.resEta.textContent = `${resData.travelTimeMinutes} min`;

      // Render Path Chips
      el.resPathChips.innerHTML = '';
      const locMap = getLocationsMap();
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

      // Show HUD banner
      el.routeHudBanner.classList.remove('hidden');
      el.bannerAlgoBadge.textContent = `${resData.algorithm} ROUTE`;
      el.bannerPathText.textContent = resData.path.map(id => locMap[id] ? locMap[id].name : id).join(' ➔ ');
      el.bannerMetaText.textContent = `${resData.roadSegments} Segments • ${resData.travelTimeMinutes} min ETA`;

      toast(`Optimal Route Found: ${resData.path.join(' ➔ ')}`, 'success');
    } else {
      toast(resData.error || 'No open route found.', 'emergency');
      el.routeHudBanner.classList.add('hidden');
      el.activePathLayer.innerHTML = '';
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
      return { success: false, error: 'No open pathway to Campus Medical Centre!' };
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
    renderQuickRoadsStrip();
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
    renderQuickRoadsStrip();
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

  function renderQuickRoadsStrip() {
    el.quickRoadsStrip.innerHTML = '';
    state.roads.forEach(road => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `quick-road-btn ${road.blocked ? 'is-blocked' : ''}`;
      btn.textContent = `${road.id} ${road.blocked ? '✖' : '✔'}`;
      btn.title = `Click to ${road.blocked ? 'reopen' : 'close'} Road ${road.id}`;
      btn.addEventListener('click', () => {
        if (road.blocked) {
          reopenRoad(road.id);
        } else {
          toggleRoadStatePrompt(road);
        }
      });
      el.quickRoadsStrip.appendChild(btn);
    });
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
        <td><strong>${l.name}</strong> ${l.isMedicalCentre ? '<span class="status-badge-blocked">MEDICAL</span>' : ''}</td>
        <td><span class="text-dim">${l.type}</span></td>
        <td class="font-mono text-dim">${connections}</td>
      `;
      el.locationsTableBody.appendChild(tr);
    });
  }

  function renderClosureFeed() {
    el.closureList.innerHTML = '';
    if (state.closures.length === 0) {
      el.closureList.innerHTML = '<li class="feed-empty">No active road closures. All 8 routes operational.</li>';
      return;
    }

    state.closures.forEach(c => {
      const li = document.createElement('li');
      li.className = 'closure-card';
      li.innerHTML = `
        <div>
          <strong class="font-mono text-red">ROAD ${c.roadId}</strong> &bull; <span>${c.reason}</span>
        </div>
        <button type="button" class="table-action-btn btn-reopen" data-road="${c.roadId}">Reopen</button>
      `;
      li.querySelector('button').addEventListener('click', () => reopenRoad(c.roadId));
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
        <th scope="row" class="font-mono"><strong>${d.id}</strong></th>
        <td><span class="status-badge-${d.priority === 'CRITICAL' ? 'blocked' : 'open'}">${d.priority}</span></td>
        <td>${d.incidentLocation}</td>
        <td>${d.description}</td>
        <td class="font-mono text-cyan">${d.etaMinutes} min</td>
      `;
      el.historyTableBody.appendChild(tr);
    });
  }

  function getLocationsMap() {
    const map = {};
    state.locations.forEach(l => { map[l.id] = l; });
    return map;
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
        const target = document.getElementById(btn.getAttribute('aria-controls'));
        if (target) target.classList.add('active');
      });
    });
  }

  function bindEvents() {
    // Route Form
    el.routeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const from = el.routeFrom.value;
      const to = el.routeTo.value;
      const algo = el.routeForm.elements['algorithm'].value;
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
      el.routeHudBanner.classList.add('hidden');
      el.activePathLayer.innerHTML = '';
      el.routeFrom.value = '';
      el.routeTo.value = '';
      renderMap();
    });

    // Simulate Vehicle
    el.animateAmbulanceBtn.addEventListener('click', () => {
      if (state.activeRoute && state.activeRoute.path) {
        simulateAmbulanceAlongPath(state.activeRoute.path);
      }
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
