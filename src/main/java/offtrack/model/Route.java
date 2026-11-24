package offtrack.model;

import java.util.*;

public final class Route {
    private final List<String> locationIds;
    public Route(List<String> locationIds) { this.locationIds = Collections.unmodifiableList(new ArrayList<>(locationIds)); }
    public List<String> getLocationIds() { return locationIds; }
    public int getRoadSegmentCount() { return Math.max(0, locationIds.size() - 1); }
    public boolean isEmpty() { return locationIds.isEmpty(); }
}
