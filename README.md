# OffTrack: Emergency Route Navigation & Web Dashboard

OffTrack is an interactive Java project for campus emergency route finding and ambulance dispatch. It features both a modular Java console application and a modern, high-performance web dashboard that connects directly to the Java backend via a built-in REST API server.

---

## Quick Start & Running

Requires Java JDK 8 or newer. From the repository root:

### 1. Compile the Java Project

```sh
javac -d out $(find src/main/java -name '*.java')
```

### 2. Launching the Application

#### Option A: Launch with Modern Web Frontend (Recommended)

Start the built-in Java HTTP server:

```sh
java -cp out offtrack.server.HttpApiServer
```
*Or using the flag:*
```sh
java -cp out offtrack.Main --web
```

Then open your browser at **`http://localhost:8080/`**.

#### Option B: Launch Terminal Console

```sh
java -cp out offtrack.Main
```
*(You can also start the web server from the console menu anytime by choosing option `11`!)*

#### Option C: Standalone Web Mode

You can also directly open `web/index.html` in any browser or with VS Code Live Server. The frontend features an intelligent dual-mode engine: it automatically connects to the Java backend on `localhost:8080` when running, and gracefully provides interactive client simulation when offline.

---

## Web Frontend Features

- **Interactive Campus Visual Network (SVG Canvas)**:
  - Visual layout of all Chitkara University campus nodes (`A` through `F`) and connecting roads (`R1` through `R8`).
  - Interactive road click: click any road segment (`R1`-`R8`) to toggle closure with a reason prompt.
  - Interactive node click: click nodes to set origin, destination, or incident points.
  - Medical Centre beacon: pulsing emergency beacon at Campus Medical Centre (`F`).
- **Vehicle Simulation (Ambulance Animation 🚑)**:
  - Smooth animation of the emergency vehicle traversing the exact path sequence node-by-node.
- **Pathfinding Engine (BFS vs DFS)**:
  - Toggle between Breadth-First Search (fewest road segments) and Depth-First Search (alternate exploratory route).
  - Glowing neon path layer highlighting the computed route on the map.
- **Emergency Ambulance Dispatch System**:
  - Dispatch emergency ambulances with priority ratings (`CRITICAL`, `HIGH`, `NORMAL`).
  - Generates tracking receipts (`DSP-X`), estimated time of arrival (ETA), and dispatches vehicle `AMB-01`.
- **Road Management & Live Closures**:
  - Real-time road status table with one-click Close and Reopen controls.
  - Active road closures log.
- **Campus Analytics & Location Directory**:
  - Real-time KPI summary counters (Locations, Active Roads, Closures, Dispatches).
  - Searchable campus location directory and full dispatch history log.

---

## Package Architecture

```text
src/main/java/offtrack/
├── Main.java               # Application launcher (console or --web)
├── exception/             # Domain and storage exceptions
├── model/                 # Map, route, incident, vehicle, and dispatch models
├── repository/            # Generic repositories and in-memory collections
├── server/                # Embedded Java HTTP REST API & static file server
│   └── HttpApiServer.java
├── service/               # BFS/DFS routing, dispatch, closures, reporting
├── ui/                    # Terminal console menu and input
└── util/                  # Sample map loader, validation, file persistence

web/                       # Modern Web Frontend
├── index.html             # Semantic HTML5 dashboard
├── styles.css             # Glassmorphism, emergency dark theme & responsive styles
└── app.js                 # Frontend application & interactive SVG controller

data/                      # Persisted road closure records
```

---

## Modern Web Guidance Compliance

The frontend was built adhering to modern web development standards:
- **Semantic HTML5 & Accessibility**: Landmark regions (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`), descriptive labels, keyboard accessible regions (`tabindex="0"` on scrollable wrappers), and single `<h1>` hierarchy.
- **Native Modal Dialogs**: Standard `<dialog>` element with `.showModal()`, `method="dialog"`, and `::backdrop` styling.
- **Responsive Container Queries**: Data tables adapt between wide desktop layouts and mobile card views using modern `@container` queries and sticky headers.
