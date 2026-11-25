package offtrack.service;

import offtrack.exception.NoRouteException;
import offtrack.model.*;
import java.util.*;

public final class BFSRouteFinder implements RouteStrategy {
    @Override public Route find(CityMap map, String startId, String destinationId) {
        Queue<PathNode> queue = new ArrayDeque<>();
        Set<String> visited = new HashSet<>();
        queue.add(new PathNode(startId, null)); visited.add(startId);
        while (!queue.isEmpty()) {
            PathNode current = queue.remove();
            if (current.getLocationId().equals(destinationId)) return new Route(current.toPath());
            for (String next : map.openNeighbors(current.getLocationId())) if (visited.add(next)) queue.add(new PathNode(next, current));
        }
        throw new NoRouteException(startId, destinationId);
    }
}
