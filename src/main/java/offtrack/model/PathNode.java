package offtrack.model;

import java.util.*;

public final class PathNode {
    private final String locationId;
    private final PathNode parent;
    public PathNode(String locationId, PathNode parent) { this.locationId = locationId; this.parent = parent; }
    public String getLocationId() { return locationId; }
    public List<String> toPath() {
        LinkedList<String> path = new LinkedList<>();
        for (PathNode node = this; node != null; node = node.parent) path.addFirst(node.locationId);
        return path;
    }
}
