package offtrack.model;

import java.util.*;

public final class CityMap {
    private final Map<String, Location> locations = new LinkedHashMap<>();
    private final Map<String, Road> roads = new LinkedHashMap<>();
    private final Map<String, List<Road>> adjacency = new LinkedHashMap<>();

    public void addLocation(Location location) {
        if (locations.containsKey(location.getId())) throw new IllegalArgumentException("Duplicate location ID: " + location.getId());
        locations.put(location.getId(), location); adjacency.put(location.getId(), new ArrayList<Road>());
    }
    public void addRoad(Road road) {
        if (roads.containsKey(road.getId())) throw new IllegalArgumentException("Duplicate road ID: " + road.getId());
        if (getLocation(road.getFirstLocationId()) == null || getLocation(road.getSecondLocationId()) == null) throw new IllegalArgumentException("Road references an unknown location.");
        roads.put(road.getId(), road);
        adjacency.get(road.getFirstLocationId()).add(road); adjacency.get(road.getSecondLocationId()).add(road);
    }
    public Location getLocation(String id) { return locations.get(id == null ? "" : id.trim().toUpperCase()); }
    public Road getRoad(String id) { return roads.get(id == null ? "" : id.trim().toUpperCase()); }
    public Collection<Location> getLocations() { return Collections.unmodifiableCollection(locations.values()); }
    public Collection<Road> getRoads() { return Collections.unmodifiableCollection(roads.values()); }
    public List<Road> roadsFrom(String locationId) { return Collections.unmodifiableList(adjacency.getOrDefault(locationId.toUpperCase(), Collections.<Road>emptyList())); }
    public List<String> openNeighbors(String locationId) {
        List<String> next = new ArrayList<>();
        for (Road road : roadsFrom(locationId)) if (!road.isBlocked()) next.add(road.otherEnd(locationId));
        return next;
    }
    public int locationCount() { return locations.size(); }
    public int roadCount() { return roads.size(); }
    public long blockedRoadCount() { return roads.values().stream().filter(Road::isBlocked).count(); }
}
