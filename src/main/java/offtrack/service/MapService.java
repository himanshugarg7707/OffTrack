package offtrack.service;

import offtrack.exception.LocationNotFoundException;
import offtrack.model.*;
import offtrack.repository.LocationRepository;
import offtrack.repository.RoadRepository;
import java.util.*;
import java.util.stream.Collectors;

public final class MapService {
    private final CityMap map;
    private final LocationRepository locations = new LocationRepository();
    private final RoadRepository roads = new RoadRepository();
    public MapService(CityMap map) {
        this.map = map;
        map.getLocations().forEach(location -> locations.save(location.getId(), location));
        map.getRoads().forEach(road -> roads.save(road.getId(), road));
    }
    public List<Location> listLocations() {
        return locations.findAll().stream().sorted(Comparator.comparing(Location::getName)).collect(Collectors.toList());
    }
    public List<Location> searchLocations(String query) {
        String normalized = query == null ? "" : query.trim().toLowerCase();
        return listLocations().stream().filter(location -> location.getName().toLowerCase().contains(normalized)
                || location.getId().toLowerCase().contains(normalized)).collect(Collectors.toList());
    }
    public MapStatistics statistics() { return new MapStatistics(map.locationCount(), map.roadCount(), map.blockedRoadCount()); }
    public Location requireLocation(String id) {
        Location location = locations.findById(id == null ? "" : id.trim().toUpperCase()).orElse(null);
        if (location == null) throw new LocationNotFoundException(id);
        return location;
    }
    public CityMap getMap() { return map; }
    public Collection<Road> listRoads() { return roads.findAll(); }
}
