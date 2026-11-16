/**
 * OffTrack - Frontend Application Controller
 * Connects with Java Backend (HttpApiServer) with automatic fallback simulation.
 */

(function () {
  'use strict';

  // Fallback Campus Map Data (matches MapLoader.java)
  const FALLBACK_LOCATIONS = [
    { id: 'A', name: 'Main Gate', type: 'GATE', isMedicalCentre: false, x: 160, y: 420 },
    { id: 'B', name: 'Hostel Road', type: 'HOSTEL', isMedicalCentre: false, x: 220, y: 210 },
    { id: 'C', name: 'Academic Block', type: 'BUILDING', isMedicalCentre: false, x: 460, y: 430 },
    { id: 'D', name: 'Library', type: 'BUILDING', isMedicalCentre: false, x: 520, y: 200 },
    { id: 'E', name: 'Sports Complex', type: 'FACILITY', isMedicalCentre: false, x: 780, y: 420 },
    { id: 'F', name: 'Campus Medical Centre', type: 'MEDICAL_CENTRE', isMedicalCentre: true, x: 800, y: 190 }
  ];

  const FALLBACK_ROADS = [
    { id: 'R1', from: 'A', to: 'B', blocked: false },
    { id: 'R2', from: 'A', to: 'C', blocked: false },
    { id: 'R3', from: 'B', to: 'D', blocked: false },
    { id: 'R4', from: 'C', to: 'D', blocked: false },
    { id: 'R5', from: 'C', to: 'E', blocked: false },
    { id: 'R6', from: 'D', to: 'F', blocked: false },
    { id: 'R7', from: 'E', to: 'F', blocked: false },
    { id: 'R8', from: 'B', to: 'C', blocked: false }
  ];

  const ICONS_BY_TYPE = {
    GATE: '🚪',
    HOSTEL: '🏢',
    BUILDING: '🎓',
    FACILITY: '⚽',
    MEDICAL_CENTRE: '🏥'
  };

  // Application State
  const state = {
    locations: [...FALLBACK_LOCATIONS],
    roads: [...FALLBACK_ROADS],
    closures: [],
    dispatches: [],
    activeRoute: null,
    selectedOrigin: null,
    selectedDest: null,
    isConnected: false,
    apiBase: determineApiBase(),
    selectedRoadForModal: null
  };

  function determineApiBase() {
    // If opened from the Java server on localhost:8080 (or another port)
    if (window.location.protocol.startsWith('http')) {
      return window.location.origin;
    }
    // If opened via file:// or another static server (e.g. port 5500)
    return 'http://localhost:8080';
  }

  // DOM Elements
  const elements = {
    statusBadge: document.getElementById('backend-status-badge'),
    statusText: document.getElementById('backend-status-text'),
    refreshBtn: document.getElementById('refresh-data-btn'),
    kpiLocations: document.getElementById('kpi-locations'),
    kpiRoads: document.getElementById('kpi-roads'),
    kpiClosures: document.getElementById('kpi-closures'),
    kpiDispatches: document.getElementById('kpi-dispatches'),
    svg: document.getElementById('campus-svg'),
    roadsLayer: document.getElementById('roads-layer'),
    activePathLayer: document.getElementById('active-path-layer'),
    nodesLayer: document.getElementById('nodes-layer'),
    vehicleLayer: document.getElementById('vehicle-layer'),
    routeBanner: document.getElementById('route-banner'),
    bannerAlgoBadge: document.getElementById('banner-algo-badge'),
    bannerPathText: document.getElementById('banner-path-text'),
    bannerMetaText: document.getElementById('banner-meta-text'),
    animateVehicleBtn: document.getElementById('animate-ambulance-btn'),
    resetRouteBtn: document.getElementById('reset-route-btn'),
    routeForm: document.getElementById('route-form'),
    routeFrom: document.getElementById('route-from'),
    routeTo: document.getElementById('route-to'),
    routeResultBox: document.getElementById('route-result-box'),
    resPathSequence: document.getElementById('res-path-sequence'),
    resSegments: document.getElementById('res-segments'),
    resEta: document.getElementById('res-eta'),
    resAlgo: document.getElementById('res-algo'),
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
    navButtons: document.querySelectorAll('.nav-btn'),
    tabPanels: document.querySelectorAll('.tab-panel')
  };

  // ========================================================
  // Initialization
  // ========================================================

  async function init() {
    setupNavigation();
    setupEventListeners();
    await checkConnectionAndLoadData();
    renderMap();
    populateSelects();
    renderRoadsTable();
    renderLocationsTable();
  }

  // ========================================================
  // Backend Communication & Fallback Simulation
  // ========================================================

  async function checkConnectionAndLoadData() {
    updateStatus('checking', 'Connecting to Java backend...');
    try {
      const res = await fetch(`${state.apiBase}/api/status`, { mode: 'cors' });
      if (res.ok) {
        const data = await res.json();
        state.isConnected = true;
        updateStatus('connected', `Connected (${data.application || 'Java Server'})`);
        await loadRemoteData();
        return;
      }
    } catch (e) {
      // Backend not running on this origin, test fallback on 8080 if origin was different
      if (state.apiBase !== 'http://localhost:8080') {
        try {
          const res = await fetch(`http://localhost:8080/api/status`, { mode: 'cors' });
          if (res.ok) {
            state.apiBase = 'http://localhost:8080';
            state.isConnected = true;
            updateStatus('connected', 'Connected (Java Server :8080)');
            await loadRemoteData();
            return;
          }
        } catch (ignored) {}
      }
    }

    // Offline / Standalone mode
    state.isConnected = false;
    updateStatus('standalone', 'Demo Mode (Standalone Simulation)');
    updateKpis();
  }

  function updateStatus(type, message) {
    elements.statusBadge.className = `status-pill status-${type}`;
    elements.statusText.textContent = message;
  }

  async function loadRemoteData() {
    try {
      const [locsRes, roadsRes, sumRes, closuresRes, dispRes] = await Promise.all([
        fetch(`${state.apiBase}/api/locations`),
        fetch(`${state.apiBase}/api/roads`),
        fetch(`${state.apiBase}/api/summary`),
        fetch(`${state.apiBase}/api/closures`),
        fetch(`${state.apiBase}/api/dispatches`)
      ]);

      if (locsRes.ok) state.locations = await locsRes.json();
      if (roadsRes.ok) state.roads = await roadsRes.json();
      if (closuresRes.ok) state.closures = await closuresRes.json();
      if (dispRes.ok) state.dispatches = await dispRes.json();

      updateKpis();
      renderMap();
      renderRoadsTable();
      renderLocationsTable();
      renderClosureList();
      renderDispatchHistory();
    } catch (err) {
      console.warn('Error fetching remote data, keeping local state:', err);
    }
  }

  function updateKpis() {
    elements.kpiLocations.textContent = state.locations.length;
    elements.kpiRoads.textContent = state.roads.length;
    const blockedCount = state.roads.filter(r => r.blocked).length;
    elements.kpiClosures.textContent = blockedCount;
    elements.kpiDispatches.textContent = state.dispatches.length;
  }

  // ========================================================
  // Graph Pathfinding (Client-Side Simulation Fallback)
  // ========================================================

  function localFindRoute(fromId, toId, useDfs) {
    const adj = {};
    state.locations.forEach(l => { adj[l.id] = []; });

    state.roads.forEach(r => {
      if (!r.blocked) {
        if (!adj[r.from]) adj[r.from] = [];
        if (!adj[r.to]) adj[r.to] = [];
        adj[r.from].push({ node: r.to, roadId: r.id });
        adj[r.to].push({ node: r.from, roadId: r.id });
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
        for (const edge of adj[curr] || []) {
          if (!visited.has(edge.node)) {
            dfs(edge.node);
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
      // BFS
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

        for (const edge of adj[currNode] || []) {
          if (!visited.has(edge.node)) {
            visited.add(edge.node);
            queue.push([...currPath, edge.node]);
          }
        }
      }
    }

    return {
      found: false,
      error: 'No route is available with the current blocked roads.'
    };
  }

  // ========================================================
  // SVG Map Rendering & Interactions
  // ========================================================

  function renderMap() {
    renderRoadsSvg();
    renderNodesSvg();
    if (state.activeRoute) {
      highlightPathOnMap(state.activeRoute.path);
    }
  }

  function renderRoadsSvg() {
    elements.roadsLayer.innerHTML = '';
    const locMap = getLocationsMap();

    state.roads.forEach(road => {
      const locA = locMap[road.from];
      const locB = locMap[road.to];
      if (!locA || !locB) return;

      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('class', `road-svg-group ${road.blocked ? 'blocked' : ''}`);

      // Road Edge Line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', locA.x);
      line.setAttribute('y1', locA.y);
      line.setAttribute('x2', locB.x);
      line.setAttribute('y2', locB.y);
      line.setAttribute('class', `svg-road ${road.blocked ? 'blocked' : ''}`);
      line.setAttribute('data-road-id', road.id);
      line.addEventListener('click', () => handleRoadClick(road));

      // Road Center Tag
      const midX = (locA.x + locB.x) / 2;
      const midY = (locA.y + locB.y) / 2;

      const tagGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      tagGroup.setAttribute('class', `road-tag-group ${road.blocked ? 'blocked' : ''}`);
      tagGroup.setAttribute('transform', `translate(${midX}, ${midY})`);
      tagGroup.addEventListener('click', (e) => {
        e.stopPropagation();
        handleRoadClick(road);
      });

      const tagRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      tagRect.setAttribute('x', -18);
      tagRect.setAttribute('y', -10);
      tagRect.setAttribute('width', 36);
      tagRect.setAttribute('height', 20);
      tagRect.setAttribute('class', 'road-tag-rect');

      const tagText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tagText.setAttribute('class', 'road-tag-text');
      tagText.textContent = road.blocked ? '🚧' : road.id;

      tagGroup.appendChild(tagRect);
      tagGroup.appendChild(tagText);

      group.appendChild(line);
      group.appendChild(tagGroup);
      elements.roadsLayer.appendChild(group);
    });
  }

  function renderNodesSvg() {
    elements.nodesLayer.innerHTML = '';

    state.locations.forEach(loc => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const isOrigin = state.selectedOrigin === loc.id;
      const isDest = state.selectedDest === loc.id;
      const isHospital = loc.id === 'F' || loc.isMedicalCentre;

      let cls = 'svg-node-group';
      if (isOrigin) cls += ' selected-origin';
      if (isDest) cls += ' selected-dest';
      if (isHospital) cls += ' is-hospital';
      group.setAttribute('class', cls);
      group.setAttribute('transform', `translate(${loc.x}, ${loc.y})`);

      // Hospital Pulse Beacon
      if (isHospital) {
        const beacon = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        beacon.setAttribute('class', 'hospital-beacon');
        beacon.setAttribute('r', 24);
        group.appendChild(beacon);
      }

      // Main Circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('class', 'svg-node-ring');
      circle.setAttribute('r', 24);

      // Icon & ID
      const textId = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textId.setAttribute('class', 'svg-node-id');
      textId.setAttribute('y', 0);
      textId.textContent = loc.id;

      // Label under node
      const textLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textLabel.setAttribute('class', 'svg-node-label');
      textLabel.setAttribute('y', 38);
      const icon = ICONS_BY_TYPE[loc.type] || '📍';
      textLabel.textContent = `${icon} ${loc.name}`;

      group.appendChild(circle);
      group.appendChild(textId);
      group.appendChild(textLabel);

      group.addEventListener('click', () => handleNodeClick(loc));
      elements.nodesLayer.appendChild(group);
    });
  }

  function handleNodeClick(loc) {
    if (!state.selectedOrigin) {
      state.selectedOrigin = loc.id;
      elements.routeFrom.value = loc.id;
      elements.dispatchLocation.value = loc.id;
      showToast(`Selected ${loc.name} (${loc.id}) as start location`, 'info');
    } else if (state.selectedOrigin === loc.id) {
      state.selectedOrigin = null;
      elements.routeFrom.value = '';
    } else {
      state.selectedDest = loc.id;
      elements.routeTo.value = loc.id;
      showToast(`Selected ${loc.name} (${loc.id}) as destination`, 'info');
      // Trigger route finding automatically
      calculateRoute(state.selectedOrigin, state.selectedDest);
    }
    renderMap();
  }

  function handleRoadClick(road) {
    if (road.blocked) {
      // Prompt to reopen
      if (confirm(`Road ${road.id} (${road.from} <-> ${road.to}) is currently BLOCKED. Reopen this road?`)) {
        reopenRoad(road.id);
      }
    } else {
      // Open standard <dialog>
      state.selectedRoadForModal = road;
      elements.modalRoadId.textContent = road.id;
      elements.modalRoadEndpoints.textContent = `${road.from} <-> ${road.to}`;
      elements.modalRoadReason.value = 'Road obstruction / Maintenance';
      elements.roadModal.showModal();
    }
  }

  // ========================================================
  // Route Highlighting & Simulation
  // ========================================================

  function highlightPathOnMap(path) {
    elements.activePathLayer.innerHTML = '';
    if (!path || path.length < 2) return;

    const locMap = getLocationsMap();
    let d = '';

    for (let i = 0; i < path.length; i++) {
      const loc = locMap[path[i]];
      if (!loc) continue;
      d += (i === 0 ? `M ${loc.x} ${loc.y}` : ` L ${loc.x} ${loc.y}`);
    }

    const pathElem = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathElem.setAttribute('d', d);
    pathElem.setAttribute('class', 'svg-active-path');
    elements.activePathLayer.appendChild(pathElem);
  }

  function animateVehicleAlongPath(path, onComplete) {
    if (!path || path.length < 2) return;
    const locMap = getLocationsMap();
    const layer = elements.vehicleLayer;
    layer.style.display = 'block';

    let currentSegment = 0;
    const durationPerSegment = 800; // ms

    function animateStep() {
      if (currentSegment >= path.length - 1) {
        showToast('Ambulance safely reached destination!', 'success');
        if (onComplete) onComplete();
        setTimeout(() => { layer.style.display = 'none'; }, 2000);
        return;
      }

      const p1 = locMap[path[currentSegment]];
      const p2 = locMap[path[currentSegment + 1]];
      const startTime = performance.now();

      function frame(now) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / durationPerSegment);
        // Easing
        const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
        const curX = p1.x + (p2.x - p1.x) * ease;
        const curY = p1.y + (p2.y - p1.y) * ease;

        layer.setAttribute('transform', `translate(${curX}, ${curY})`);

        if (progress < 1) {
          requestAnimationFrame(frame);
        } else {
          currentSegment++;
          animateStep();
        }
      }
      requestAnimationFrame(frame);
    }

    animateStep();
  }

  // ========================================================
  // Action Handlers: Route, Dispatch, Closures
  // ========================================================

  async function calculateRoute(from, to, algorithm = 'bfs') {
    if (!from || !to) return;
    showToast(`Calculating ${algorithm.toUpperCase()} route...`, 'info');

    let result;
    if (state.isConnected) {
      try {
        const res = await fetch(`${state.apiBase}/api/route`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ from, to, algorithm })
        });
        result = await res.json();
      } catch (e) {
        result = localFindRoute(from, to, algorithm === 'dfs');
      }
    } else {
      result = localFindRoute(from, to, algorithm === 'dfs');
    }

    if (result.found) {
      state.activeRoute = result;
      state.selectedOrigin = from;
      state.selectedDest = to;
      highlightPathOnMap(result.path);
      renderMap();

      // Show result UI
      elements.routeResultBox.classList.remove('hidden');
      elements.resPathSequence.textContent = result.path.join(' ➔ ');
      elements.resSegments.textContent = result.roadSegments;
      elements.resEta.textContent = `${result.travelTimeMinutes} min`;
      elements.resAlgo.textContent = result.algorithm === 'BFS' ? 'Breadth-First (Shortest)' : 'Depth-First (Alternative)';

      // Show floating banner
      elements.routeBanner.classList.remove('hidden');
      elements.bannerAlgoBadge.textContent = `${result.algorithm} Route`;
      elements.bannerPathText.textContent = result.path.join(' ➔ ');
      elements.bannerMetaText.textContent = `${result.roadSegments} Segments • ${result.travelTimeMinutes} min ETA`;
      showToast(`Route found: ${result.path.join(' ➔ ')}`, 'success');
    } else {
      showToast(result.error || 'No route found.', 'emergency');
      elements.routeBanner.classList.add('hidden');
      elements.activePathLayer.innerHTML = '';
    }
  }

  async function dispatchAmbulance(locationId, description, priority) {
    showToast(`Dispatching emergency ambulance to ${locationId}...`, 'emergency');

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
        receipt = localDispatch(locationId, description, priority);
      }
    } else {
      receipt = localDispatch(locationId, description, priority);
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
      state.selectedDest = receipt.destination || 'F';

      // Update Receipt Box
      elements.dispatchReceiptBox.classList.remove('hidden');
      elements.receiptId.textContent = receipt.id;
      elements.receiptVehicle.textContent = receipt.vehicle;
      elements.receiptIncident.textContent = `${receipt.description} at ${receipt.incidentLocation}`;
      elements.receiptRoute.textContent = receipt.path.join(' ➔ ');
      elements.receiptEta.textContent = `${receipt.etaMinutes} minutes`;

      renderMap();
      renderDispatchHistory();
      updateKpis();

      // Trigger automatic vehicle animation
      animateVehicleAlongPath(receipt.path);
      showToast(`Ambulance ${receipt.id} dispatched!`, 'emergency');
    } else {
      showToast(receipt.error || 'Could not dispatch ambulance.', 'emergency');
    }
  }

  function localDispatch(locationId, description, priority) {
    const routeRes = localFindRoute(locationId, 'F', false);
    if (!routeRes.found) {
      return { success: false, error: 'No open route to Campus Medical Centre!' };
    }
    const nextId = `DSP-${String(state.dispatches.length + 1).padStart(3, '0')}`;
    return {
      success: true,
      id: nextId,
      status: 'DISPATCHED',
      vehicle: 'Ambulance AMB-01',
      priority: priority,
      incidentLocation: locationId,
      destination: 'F',
      description: description,
      path: routeRes.path,
      segments: routeRes.roadSegments,
      etaMinutes: routeRes.travelTimeMinutes,
      etaString: `${routeRes.travelTimeMinutes} min`
    };
  }

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

    // Update local state
    const target = state.roads.find(r => r.id === roadId);
    if (target) target.blocked = true;
    state.closures.push({
      roadId,
      reason,
      reportedAt: new Date().toLocaleTimeString()
    });

    renderMap();
    renderRoadsTable();
    renderClosureList();
    updateKpis();
    showToast(`Road ${roadId} marked as BLOCKED`, 'emergency');

    // Re-calculate active route if it relied on this road
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

    const target = state.roads.find(r => r.id === roadId);
    if (target) target.blocked = false;
    state.closures = state.closures.filter(c => c.roadId !== roadId);

    renderMap();
    renderRoadsTable();
    renderClosureList();
    updateKpis();
    showToast(`Road ${roadId} reopened for traffic`, 'success');

    if (state.activeRoute) {
      calculateRoute(state.selectedOrigin, state.selectedDest, state.activeRoute.algorithm.toLowerCase());
    }
  }

  // ========================================================
  // DOM Rendering & Tables
  // ========================================================

  function populateSelects() {
    const locs = state.locations;
    elements.routeFrom.innerHTML = '<option value="">Select Origin...</option>';
    elements.routeTo.innerHTML = '<option value="">Select Destination...</option>';
    elements.dispatchLocation.innerHTML = '<option value="">Select Incident Point...</option>';

    locs.forEach(loc => {
      const opt1 = new Option(`${loc.id} - ${loc.name}`, loc.id);
      const opt2 = new Option(`${loc.id} - ${loc.name}`, loc.id);
      const opt3 = new Option(`${loc.id} - ${loc.name}`, loc.id);
      elements.routeFrom.add(opt1);
      elements.routeTo.add(opt2);
      elements.dispatchLocation.add(opt3);
    });
  }

  function renderRoadsTable() {
    elements.roadsTableBody.innerHTML = '';
    state.roads.forEach(road => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <th scope="row"><strong>${road.id}</strong></th>
        <td>${road.from} &harr; ${road.to}</td>
        <td>
          <span class="badge ${road.blocked ? 'badge-danger' : 'badge-success'}">
            ${road.blocked ? 'BLOCKED' : 'OPEN'}
          </span>
        </td>
        <td>
          <button type="button" class="btn-sm ${road.blocked ? 'btn-primary' : 'btn-danger'}" data-road="${road.id}">
            ${road.blocked ? 'Reopen' : 'Close'}
          </button>
        </td>
      `;
      const btn = tr.querySelector('button');
      btn.addEventListener('click', () => {
        if (road.blocked) {
          reopenRoad(road.id);
        } else {
          handleRoadClick(road);
        }
      });
      elements.roadsTableBody.appendChild(tr);
    });
  }

  function renderLocationsTable(filter = '') {
    elements.locationsTableBody.innerHTML = '';
    const term = filter.toLowerCase().trim();
    const locMap = getLocationsMap();

    const filtered = state.locations.filter(loc =>
      loc.id.toLowerCase().includes(term) || loc.name.toLowerCase().includes(term)
    );

    if (filtered.length === 0) {
      elements.locationsTableBody.innerHTML = '<tr class="empty-row"><td colspan="4">No locations match query.</td></tr>';
      return;
    }

    filtered.forEach(loc => {
      // Find connected roads
      const connections = state.roads
        .filter(r => r.from === loc.id || r.to === loc.id)
        .map(r => `${r.id} (${r.from === loc.id ? r.to : r.from})`)
        .join(', ');

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <th scope="row"><strong>${loc.id}</strong></th>
        <td>${loc.name} ${loc.id === 'F' ? '<span class="badge badge-danger">Medical Centre</span>' : ''}</td>
        <td><span class="badge badge-info">${loc.type}</span></td>
        <td class="font-mono">${connections || 'None'}</td>
      `;
      elements.locationsTableBody.appendChild(tr);
    });
  }

  function renderClosureList() {
    elements.closureList.innerHTML = '';
    if (state.closures.length === 0) {
      elements.closureList.innerHTML = '<li class="empty-state">No road closures currently reported. All lanes clear.</li>';
      return;
    }

    state.closures.forEach(closure => {
      const li = document.createElement('li');
      li.className = 'closure-item';
      li.innerHTML = `
        <div>
          <strong>Road ${closure.roadId}</strong> &bull; <span>${closure.reason}</span>
        </div>
        <button type="button" class="btn-sm btn-ghost" data-road="${closure.roadId}">Reopen</button>
      `;
      li.querySelector('button').addEventListener('click', () => reopenRoad(closure.roadId));
      elements.closureList.appendChild(li);
    });
  }

  function renderDispatchHistory() {
    elements.historyTableBody.innerHTML = '';
    if (state.dispatches.length === 0) {
      elements.historyTableBody.innerHTML = '<tr class="empty-row"><td colspan="5">No dispatches recorded yet.</td></tr>';
      return;
    }

    state.dispatches.forEach(d => {
      const tr = document.createElement('tr');
      const prioClass = d.priority === 'CRITICAL' ? 'badge-danger' : (d.priority === 'HIGH' ? 'badge-warning' : 'badge-info');
      tr.innerHTML = `
        <th scope="row" class="font-mono"><strong>${d.id}</strong></th>
        <td><span class="badge ${prioClass}">${d.priority}</span></td>
        <td>${d.incidentLocation}</td>
        <td>${d.description}</td>
        <td class="font-mono text-cyan">${d.etaMinutes} min</td>
      `;
      elements.historyTableBody.appendChild(tr);
    });
  }

  function getLocationsMap() {
    const map = {};
    state.locations.forEach(loc => { map[loc.id] = loc; });
    return map;
  }

  // ========================================================
  // Navigation & UI Event Wiring
  // ========================================================

  function setupNavigation() {
    elements.navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.navButtons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        elements.tabPanels.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        const targetId = btn.getAttribute('aria-controls');
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) targetPanel.classList.add('active');
      });
    });
  }

  function setupEventListeners() {
    // Route Finder Form
    elements.routeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const from = elements.routeFrom.value;
      const to = elements.routeTo.value;
      const algo = elements.routeForm.elements['algorithm'].value;
      if (from === to) {
        showToast('Start and Destination cannot be the same!', 'emergency');
        return;
      }
      calculateRoute(from, to, algo);
    });

    // Emergency Dispatch Form
    elements.dispatchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const loc = elements.dispatchLocation.value;
      const desc = elements.dispatchDesc.value;
      const prio = elements.dispatchForm.elements['priority'].value;
      dispatchAmbulance(loc, desc, prio);
    });

    // Refresh Live Data
    elements.refreshBtn.addEventListener('click', () => {
      checkConnectionAndLoadData();
      showToast('Checked server status & refreshed data', 'info');
    });

    // Reset Route
    elements.resetRouteBtn.addEventListener('click', () => {
      state.activeRoute = null;
      state.selectedOrigin = null;
      state.selectedDest = null;
      elements.routeResultBox.classList.add('hidden');
      elements.routeBanner.classList.add('hidden');
      elements.activePathLayer.innerHTML = '';
      elements.routeFrom.value = '';
      elements.routeTo.value = '';
      renderMap();
    });

    // Simulate Vehicle Button
    elements.animateVehicleBtn.addEventListener('click', () => {
      if (state.activeRoute && state.activeRoute.path) {
        animateVehicleAlongPath(state.activeRoute.path);
      }
    });

    // Search Locations
    elements.locSearch.addEventListener('input', (e) => {
      renderLocationsTable(e.target.value);
    });

    // Modal Close
    elements.dialogCloseBtn.addEventListener('click', () => elements.roadModal.close());
    elements.modalCancelBtn.addEventListener('click', () => elements.roadModal.close());

    // Modal Submit
    elements.roadCloseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const reason = elements.modalRoadReason.value || 'Reported blockage';
      if (state.selectedRoadForModal) {
        closeRoad(state.selectedRoadForModal.id, reason);
      }
      elements.roadModal.close();
    });
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'emergency' ? '🚨' : (type === 'success' ? '✅' : 'ℹ️');
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    elements.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = '0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
