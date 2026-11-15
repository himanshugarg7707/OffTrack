import java.util.*;

public class Main {
    public static void main(String[] args) {
        new OffTrackApp().start();
    }
}

class OffTrackApp {
    private final ConsoleMenu menu = new ConsoleMenu();
    private final Scanner scanner = new Scanner(System.in);
    private final NavigationService navigation = MapLoader.loadSampleMap();

    void start() {
        System.out.println("=== OFFTRACK: Emergency Route Navigation ===");
        System.out.println("Terminal demo. Routes use number of road segments (distance data can be added later).\n");
        boolean running = true;
        while (running) {
            menu.show();
            String choice = scanner.nextLine().trim();
            switch (choice) {
                case "1": navigation.printLocations(); break;
                case "2": findRoute(false); break;
                case "3": findRoute(true); break;
                case "4": addObstacle(); break;
                case "5": navigation.printObstacles(); break;
                case "0": running = false; break;
                default: System.out.println("Please select a listed option.");
            }
        }
        System.out.println("Navigation ended. Stay safe!");
    }

    private void findRoute(boolean depthFirst) {
        navigation.printLocations();
        System.out.print("Start location ID: "); String start = scanner.nextLine().trim();
        System.out.print("Destination ID: "); String end = scanner.nextLine().trim();
        Route route = navigation.findRoute(start, end, depthFirst);
        RoutePrinter.print(route, depthFirst ? "DFS route" : "Shortest BFS route");
    }

    private void addObstacle() {
        navigation.printRoads();
        System.out.print("Road ID to block: ");
        boolean added = navigation.reportObstacle(scanner.nextLine().trim());
        System.out.println(added ? "Road marked blocked." : "Unknown road ID.");
    }
}

class ConsoleMenu {
    void show() {
        System.out.println("\n1. Show locations\n2. Find shortest route (BFS)\n3. Find a route (DFS)\n4. Report blocked road\n5. Show blocked roads\n0. Exit");
        System.out.print("Choice: ");
    }
}

class NavigationService {
    private final CityMap map;
    private final RouteFinder bfs = new BFSRouteFinder();
    private final RouteFinder dfs = new DFSRouteFinder();
    private final ObstacleManager obstacles = new ObstacleManager();
    NavigationService(CityMap map) { this.map = map; }
    Route findRoute(String from, String to, boolean depthFirst) {
        if (!map.hasLocation(from) || !map.hasLocation(to)) return Route.notFound("Invalid location ID.");
        RouteFinder finder = depthFirst ? dfs : bfs;
        return finder.find(map, from, to, obstacles);
    }
    void printLocations() { map.printLocations(); }
    void printRoads() { map.printRoads(); }
    boolean reportObstacle(String roadId) {
        Road road = map.getRoad(roadId);
        if (road == null) return false;
        obstacles.block(road);
        return true;
    }
    void printObstacles() { obstacles.print(); }
}

class CityMap {
    private final LocationRepository locations = new LocationRepository();
    private final RoadRepository roads = new RoadRepository();
    private final Graph graph = new Graph();
    void addLocation(Location location) { locations.add(location); graph.addVertex(location.getId()); }
    void addRoad(Road road) { roads.add(road); graph.addEdge(road); }
    boolean hasLocation(String id) { return locations.find(id) != null; }
    Location getLocation(String id) { return locations.find(id); }
    Road getRoad(String id) { return roads.find(id); }
    List<String> neighbors(String id) { return graph.neighbors(id); }
    List<Road> roadsFrom(String id) { return graph.roadsFrom(id); }
    void printLocations() { locations.print(); }
    void printRoads() { roads.print(); }
}


class Location {
    private final String id, name;
    Location(String id, String name) { this.id = id; this.name = name; }
    String getId() { return id; }
    String getName() { return name; }
    @Override public String toString() { return id + " - " + name; }
}

class Road {
    private final String id, from, to;
    private boolean blocked;
    Road(String id, String from, String to) { this.id = id; this.from = from; this.to = to; }
    String getId() { return id; }
    String getFrom() { return from; }
    String getTo() { return to; }
    boolean isBlocked() { return blocked; }
    void setBlocked(boolean blocked) { this.blocked = blocked; }
    String otherEnd(String location) { return from.equals(location) ? to : from; }
    @Override public String toString() { return id + " (" + from + " <-> " + to + ")" + (blocked ? " [BLOCKED]" : ""); }
}

class Graph {
    private final Map<String, List<Road>> adjacency = new LinkedHashMap<>();
    void addVertex(String id) { adjacency.putIfAbsent(id, new ArrayList<>()); }
    void addEdge(Road road) {
        adjacency.get(road.getFrom()).add(road);
        adjacency.get(road.getTo()).add(road);
    }
    List<Road> roadsFrom(String id) { return adjacency.getOrDefault(id, Collections.emptyList()); }
    List<String> neighbors(String id) {
        List<String> result = new ArrayList<>();
        for (Road road : roadsFrom(id)) if (!road.isBlocked()) result.add(road.otherEnd(id));
        return result;
    }
}

class Route {
    private final List<String> locationIds;
    private final boolean found;
    private final String message;
    Route(List<String> ids) { locationIds = ids; found = true; message = ""; }
    private Route(String message) { locationIds = new ArrayList<>(); found = false; this.message = message; }
    static Route notFound(String message) { return new Route(message); }
    boolean isFound() { return found; }
    String getMessage() { return message; }
    List<String> getLocationIds() { return locationIds; }
}

interface RouteFinder { Route find(CityMap map, String start, String goal, ObstacleManager obstacles); }
class BFSRouteFinder implements RouteFinder {
    public Route find(CityMap map, String start, String goal, ObstacleManager obstacles) {
        Queue<PathNode> queue = new ArrayDeque<>();
        Set<String> visited = new HashSet<>();
        queue.add(new PathNode(start, null)); visited.add(start);
        while (!queue.isEmpty()) {
            PathNode current = queue.remove();
            if (current.location.equals(goal)) return new Route(current.path());
            for (String next : map.neighbors(current.location)) if (visited.add(next)) queue.add(new PathNode(next, current));
        }
        return Route.notFound("No route is available with the current blocked roads.");
    }
}
class DFSRouteFinder implements RouteFinder {
    public Route find(CityMap map, String start, String goal, ObstacleManager obstacles) {
        Stack<PathNode> stack = new Stack<>();
        Set<String> visited = new HashSet<>();
        stack.push(new PathNode(start, null));
        while (!stack.isEmpty()) {
            PathNode current = stack.pop();
            if (!visited.add(current.location)) continue;
            if (current.location.equals(goal)) return new Route(current.path());
            List<String> nextLocations = map.neighbors(current.location);
            for (int i = nextLocations.size() - 1; i >= 0; i--) {
                String next = nextLocations.get(i);
                if (!visited.contains(next)) stack.push(new PathNode(next, current));
            }
        }
        return Route.notFound("No route is available with the current blocked roads.");
    }
}

class PathNode {
    final String location;
    final PathNode parent;
    PathNode(String location, PathNode parent) { this.location = location; this.parent = parent; }
    List<String> path() {
        LinkedList<String> result = new LinkedList<>();
        for (PathNode node = this; node != null; node = node.parent) result.addFirst(node.location);
        return result;
    }
}

class ObstacleManager {
    private final List<Obstacle> obstacles = new ArrayList<>();
    void block(Road road) {
        if (road.isBlocked()) return;
        road.setBlocked(true);
        obstacles.add(new Obstacle(road));
    }
    void print() {
        if (obstacles.isEmpty()) { System.out.println("No blocked roads reported."); return; }
        for (Obstacle obstacle : obstacles) System.out.println(obstacle);
    }
}
class Obstacle {
    private final Road road;
    Obstacle(Road road) { this.road = road; }
    @Override public String toString() { return "Blocked road: " + road; }
}

class EmergencyVehicle {
    private final String type;
    EmergencyVehicle(String type) { this.type = type; }
    String getType() { return type; }
}
class Ambulance extends EmergencyVehicle { Ambulance() { super("Ambulance"); } }
class RoutePrinter {
    static void print(Route route, String title) {
        System.out.println("\n" + title + ":");
        if (!route.isFound()) { System.out.println(route.getMessage()); return; }
        System.out.println(String.join(" -> ", route.getLocationIds()));
        System.out.println("Road segments: " + (route.getLocationIds().size() - 1));
    }
}
class MapLoader {
    static NavigationService loadSampleMap() {
        CityMap map = new CityMap();
        map.addLocation(new Location("A", "Main Gate"));
        map.addLocation(new Location("B", "Hostel Road"));
        map.addLocation(new Location("C", "Academic Block"));
        map.addLocation(new Location("D", "Library"));
        map.addLocation(new Location("E", "Sports Complex"));
        map.addLocation(new Location("F", "Campus Medical Centre"));
        map.addRoad(new Road("R1", "A", "B")); map.addRoad(new Road("R2", "A", "C"));
        map.addRoad(new Road("R3", "B", "D")); map.addRoad(new Road("R4", "C", "D"));
        map.addRoad(new Road("R5", "C", "E")); map.addRoad(new Road("R6", "D", "F"));
        map.addRoad(new Road("R7", "E", "F")); map.addRoad(new Road("R8", "B", "C"));
        return new NavigationService(map);
    }
}
class LocationRepository {
    private final Map<String, Location> items = new LinkedHashMap<>();
    void add(Location item) { items.put(item.getId(), item); }
    Location find(String id) { return items.get(id); }
    void print() { for (Location item : items.values()) System.out.println(item); }
}
class RoadRepository {
    private final Map<String, Road> items = new LinkedHashMap<>();
    void add(Road item) { items.put(item.getId(), item); }
    Road find(String id) { return items.get(id); }
    void print() { for (Road item : items.values()) System.out.println(item); }
}

// Small utility types keep the demo organized into beginner-friendly OOP classes.
class LocationId { private final String value; LocationId(String value) { this.value = value; } String value() { return value; } }
class RoadId { private final String value; RoadId(String value) { this.value = value; } String value() { return value; } }
class RouteRequest { private final String start, end; RouteRequest(String start, String end) { this.start = start; this.end = end; } String start() { return start; } String end() { return end; } }
class RouteResult { private final Route route; RouteResult(Route route) { this.route = route; } Route route() { return route; } }
class MapPrinter { void print(CityMap map) { map.printLocations(); } }
class RoadBlocker { void block(Road road) { road.setBlocked(true); } }
class RouteLength { int of(Route route) { return Math.max(0, route.getLocationIds().size() - 1); } }
class SearchStatus { private boolean found; void markFound() { found = true; } boolean isFound() { return found; } }
class EmergencyDispatch { private final Ambulance ambulance = new Ambulance(); String vehicleName() { return ambulance.getType(); } }
class NavigationConfig { private final String mapName = "Chitkara University sample map"; String getMapName() { return mapName; } }
class RoadConnection { private final Road road; RoadConnection(Road road) { this.road = road; } Road getRoad() { return road; } }
