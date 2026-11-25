package offtrack.service;

import offtrack.exception.NoRouteException;
import offtrack.model.*;
import java.util.*;

public final class DFSRouteFinder implements RouteStrategy {
    @Override public Route find(CityMap map, String startId, String destinationId) {
        Deque<PathNode> stack = new ArrayDeque<>();
        Set<String> visited = new HashSet<>();
        stack.push(new PathNode(startId, null));
        while (!stack.isEmpty()) {
            PathNode current = stack.pop();
            if (!visited.add(current.getLocationId())) continue;
            if (current.getLocationId().equals(destinationId)) return new Route(current.toPath());
            List<String> neighbors = map.openNeighbors(current.getLocationId());
            for (int i = neighbors.size() - 1; i >= 0; i--) if (!visited.contains(neighbors.get(i))) stack.push(new PathNode(neighbors.get(i), current));
        }
        throw new NoRouteException(startId, destinationId);
    }
}
