# OffTrack (terminal version)

A beginner-friendly Java console demo for emergency route finding and campus dispatch. The sample map represents a small campus network; replace its locations and roads in `MapLoader` to use another map. The single source file contains 51 Java classes (plus 1 interface and 2 enums) demonstrating clean OOP design and graph data structures.

## Requirements

- Java JDK 8 or newer

## Run Instructions

From this folder:

```sh
javac Main.java
java Main
```

## Features

- **Shortest Route Navigation (BFS)**: Uses Breadth-First Search to find the route with the fewest road segments between any two locations.
- **Alternative Pathfinding (DFS)**: Uses Depth-First Search with backtracking to explore alternate pathways.
- **Road Management & Closures**: Mark roads as blocked/closed and reopen them dynamically. Route finders will automatically bypass blocked segments.
- **Ambulance Dispatch System**: Dispatch emergency vehicles (Ambulance) from any incident location directly to the Campus Medical Centre (`F`). Generates a tracking Dispatch ID (`DSP-X`), calculates the route via BFS, and displays an illustrative arrival time estimate (ETA).
- **Campus Map Statistics**: View total locations, total roads, active road closures, and medical facility destinations at a glance.

## Menu Options

1. **Show locations**: Display all campus nodes and names.
2. **Find shortest route (BFS)**: Calculate the shortest path between two points.
3. **Find a route (DFS)**: Find an alternative path using depth-first search.
4. **Report blocked road**: Close a road segment due to an obstacle or incident.
5. **Show blocked roads**: List all currently blocked roads.
6. **Reopen a road**: Restore a blocked road back to active status.
7. **Show map summary**: View campus map statistics and location details.
8. **Dispatch ambulance to medical centre**: Trigger an emergency dispatch with route and ETA.
0. **Exit**: Terminate navigation session.

> **Note**: Routes count road segments; actual distance, traffic, GPS, and live emergency service data are not included. The source is kept in a single file (`Main.java`) so it is easy to compile, inspect, and present for academic demonstrations.
