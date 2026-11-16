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
    private final DispatchService dispatch = new DispatchService(navigation);

    void start() {
        System.out.println("=== OFFTRACK: Emergency Route Navigation ===");
        System.out.println("Campus emergency navigation demo. Travel times are illustrative.\n");
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
                case "6": reopenRoad(); break;
                case "7": navigation.printMapSummary(); break;
                case "8": dispatchEmergency(); break;
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

    private void reopenRoad() {
        navigation.printObstacles();
        System.out.print("Road ID to reopen: ");
        System.out.println(navigation.clearObstacle(scanner.nextLine().trim())
                ? "Road reopened." : "That road is not currently blocked.");
    }

    private void dispatchEmergency() {
        navigation.printLocations();
        System.out.print("Incident location ID: "); String origin = scanner.nextLine().trim();
        System.out.print("Short incident description: "); String details = scanner.nextLine().trim();
        DispatchReceipt receipt = dispatch.sendAmbulance(origin, details);
        receipt.print();
    }
}

class ConsoleMenu {
    void show() {
        System.out.println("\n1. Show locations\n2. Find shortest route (BFS)\n3. Find a route (DFS)\n4. Report blocked road\n5. Show blocked roads\n6. Reopen a road\n7. Show map summary\n8. Dispatch ambulance to medical centre\n0. Exit");
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
    boolean clearObstacle(String roadId) {
        Road road = map.getRoad(roadId);
        if (road == null || !road.isBlocked()) return false;
        obstacles.clear(road);
        return true;
    }
    void printMapSummary() { new MapSummary(map).print(); }
    Location location(String id) { return map.getLocation(id); }
    String medicalCentreId() { return "F"; }
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
    int locationCount() { return locations.size(); }
    int roadCount() { return roads.size(); }
    int blockedRoadCount() { return roads.blockedCount(); }
    Collection<Location> allLocations() { return locations.all(); }
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
    void clear(Road road) {
        road.setBlocked(false);
        obstacles.removeIf(obstacle -> obstacle.roadId().equals(road.getId()));
    }
    void print() {
        if (obstacles.isEmpty()) { System.out.println("No blocked roads reported."); return; }
        for (Obstacle obstacle : obstacles) System.out.println(obstacle);
    }
}
class Obstacle {
    private final Road road;
    Obstacle(Road road) { this.road = road; }
    String roadId() { return road.getId(); }
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
    int size() { return items.size(); }
    Collection<Location> all() { return items.values(); }
}
class RoadRepository {
    private final Map<String, Road> items = new LinkedHashMap<>();
    void add(Road item) { items.put(item.getId(), item); }
    Road find(String id) { return items.get(id); }
    void print() { for (Road item : items.values()) System.out.println(item); }
    int size() { return items.size(); }
    int blockedCount() { int count = 0; for (Road road : items.values()) if (road.isBlocked()) count++; return count; }
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

// Emergency dispatch feature: find a route from an incident to the medical centre.
class DispatchService {
    private final NavigationService navigation;
    private final DispatchHistory history = new DispatchHistory();
    private final DispatchIdGenerator ids = new DispatchIdGenerator();
    private final ETAEstimator eta = new ETAEstimator();
    DispatchService(NavigationService navigation) { this.navigation = navigation; }
    DispatchReceipt sendAmbulance(String originId, String description) {
        Location origin = navigation.location(originId);
        if (origin == null) return DispatchReceipt.failed("Unknown incident location ID.");
        Incident incident = new Incident(origin, description);
        Route route = navigation.findRoute(originId, navigation.medicalCentreId(), false);
        if (!route.isFound()) return DispatchReceipt.failed("No open route to the medical centre. Check road closures.");
        DispatchRecord record = new DispatchRecord(ids.next(), incident, new Ambulance(), route, eta.estimate(route));
        history.add(record);
        return new DispatchReceipt(record, "Ambulance dispatched.");
    }
}

class Incident {
    private final Location location;
    private final String description;
    Incident(Location location, String description) {
        this.location = location;
        this.description = description.isEmpty() ? "Emergency assistance requested" : description;
    }
    Location location() { return location; }
    String description() { return description; }
}

class DispatchRecord {
    private final String id;
    private final Incident incident;
    private final EmergencyVehicle vehicle;
    private final Route route;
    private final TravelTime eta;
    private final DispatchStatus status = DispatchStatus.DISPATCHED;
    DispatchRecord(String id, Incident incident, EmergencyVehicle vehicle, Route route, TravelTime eta) {
        this.id = id; this.incident = incident; this.vehicle = vehicle; this.route = route; this.eta = eta;
    }
    String id() { return id; }
    Incident incident() { return incident; }
    EmergencyVehicle vehicle() { return vehicle; }
    Route route() { return route; }
    TravelTime eta() { return eta; }
    DispatchStatus status() { return status; }
}

class DispatchHistory {
    private final List<DispatchRecord> records = new ArrayList<>();
    void add(DispatchRecord record) { records.add(record); }
    int count() { return records.size(); }
}

enum DispatchStatus { DISPATCHED }
enum PriorityLevel { EMERGENCY }

class ETAEstimator {
    private static final int MINUTES_PER_SEGMENT = 2;
    TravelTime estimate(Route route) { return new TravelTime(new RouteLength().of(route) * MINUTES_PER_SEGMENT); }
}

class TravelTime {
    private final int minutes;
    TravelTime(int minutes) { this.minutes = minutes; }
    int minutes() { return minutes; }
    @Override public String toString() { return minutes + " minute(s) (illustrative estimate)"; }
}

class MapSummary {
    private final CityMap map;
    MapSummary(CityMap map) { this.map = map; }
    void print() {
        MapStatistics stats = new MapStatistics(map.locationCount(), map.roadCount(), map.blockedRoadCount());
        System.out.println("\nMap: " + new NavigationConfig().getMapName());
        System.out.println("Locations: " + stats.locations() + " | Roads: " + stats.roads() + " | Blocked: " + stats.blockedRoads());
        System.out.println("Medical destination: " + new CampusHospital().name());
        for (Location location : map.allLocations()) System.out.println(" - " + new LocationNameFormatter().format(location));
    }
}

class MapStatistics {
    private final int locations, roads, blockedRoads;
    MapStatistics(int locations, int roads, int blockedRoads) {
        this.locations = locations; this.roads = roads; this.blockedRoads = blockedRoads;
    }
    int locations() { return locations; }
    int roads() { return roads; }
    int blockedRoads() { return blockedRoads; }
}

class ClosureService {
    boolean close(Road road) { if (road.isBlocked()) return false; road.setBlocked(true); return true; }
    boolean reopen(Road road) { if (!road.isBlocked()) return false; road.setBlocked(false); return true; }
}

class RoadStatus {
    private final Road road;
    RoadStatus(Road road) { this.road = road; }
    boolean isOpen() { return !road.isBlocked(); }
}

class RoadUpdate {
    private final Road road;
    private final boolean blocked;
    RoadUpdate(Road road, boolean blocked) { this.road = road; this.blocked = blocked; }
    String message() { return road.getId() + (blocked ? " closed" : " reopened"); }
}

class RoadUpdateHistory {
    private final List<RoadUpdate> updates = new ArrayList<>();
    void add(RoadUpdate update) { updates.add(update); }
    int size() { return updates.size(); }
}

class CampusHospital {
    String id() { return "F"; }
    String name() { return "Campus Medical Centre"; }
}

class DispatchIdGenerator {
    private int next = 1;
    String next() { return "DSP-" + next++; }
}

class DispatchReceipt {
    private final DispatchRecord record;
    private final String message;
    DispatchReceipt(DispatchRecord record, String message) { this.record = record; this.message = message; }
    static DispatchReceipt failed(String message) { return new DispatchReceipt(null, message); }
    void print() {
        System.out.println("\n" + message);
        if (record == null) return;
        System.out.println("Dispatch ID: " + record.id() + " | Status: " + record.status());
        System.out.println("Vehicle: " + record.vehicle().getType() + " | Priority: " + PriorityLevel.EMERGENCY);
        System.out.println("Incident: " + record.incident().description() + " at " + record.incident().location());
        RoutePrinter.print(record.route(), "Route to medical centre");
        System.out.println("Estimated arrival: " + record.eta());
    }
}

class LocationNameFormatter {
    String format(Location location) { return location.getId() + " - " + location.getName(); }
}

class TrafficLevel {
    private final int minutesPerSegment;
    TrafficLevel(int minutesPerSegment) { this.minutesPerSegment = Math.max(1, minutesPerSegment); }
    int minutesPerSegment() { return minutesPerSegment; }
}

class RouteLeg {
    private final String from, to;
    RouteLeg(String from, String to) { this.from = from; this.to = to; }
    String description() { return from + " to " + to; }
}

class RouteLegBuilder {
    List<RouteLeg> build(Route route) {
        List<RouteLeg> legs = new ArrayList<>();
        List<String> ids = route.getLocationIds();
        for (int i = 0; i + 1 < ids.size(); i++) legs.add(new RouteLeg(ids.get(i), ids.get(i + 1)));
        return legs;
    }
}

class IncidentValidator {
    boolean isValid(String description) { return description != null && !description.trim().isEmpty(); }
}
