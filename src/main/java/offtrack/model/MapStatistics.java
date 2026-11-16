package offtrack.model;

public final class MapStatistics {
    private final int locations, roads;
    private final long blockedRoads;
    public MapStatistics(int locations, int roads, long blockedRoads) { this.locations = locations; this.roads = roads; this.blockedRoads = blockedRoads; }
    public int getLocations() { return locations; }
    public int getRoads() { return roads; }
    public long getBlockedRoads() { return blockedRoads; }
}
