package offtrack.service;

import offtrack.exception.LocationNotFoundException;
import offtrack.model.*;

public final class RouteService {
    private final CityMap map;
    private final RouteStrategy bfs = new BFSRouteFinder();
    private final RouteStrategy dfs = new DFSRouteFinder();
    public RouteService(CityMap map) { this.map = map; }
    public Route find(RouteRequest request, boolean depthFirst) {
        String from = normalize(request.getStartId()), to = normalize(request.getDestinationId());
        if (map.getLocation(from) == null) throw new LocationNotFoundException(from);
        if (map.getLocation(to) == null) throw new LocationNotFoundException(to);
        return (depthFirst ? dfs : bfs).find(map, from, to);
    }
    public Route shortest(String from, String to) { return find(new RouteRequest(from, to), false); }
    private String normalize(String id) { return id == null ? "" : id.trim().toUpperCase(); }
}
