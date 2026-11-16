package offtrack.service;

import offtrack.exception.RoadNotFoundException;
import offtrack.model.*;
import offtrack.repository.RoadClosureRepository;
import offtrack.util.ClosureFileStore;
import java.util.*;
import java.util.stream.Collectors;

public final class RoadClosureService {
    private final CityMap map;
    private final RoadClosureRepository closures = new RoadClosureRepository();
    private final ClosureFileStore fileStore;
    public RoadClosureService(CityMap map, ClosureFileStore fileStore) {
        this.map = map; this.fileStore = fileStore;
        for (Map.Entry<String, String> saved : fileStore.load().entrySet()) {
            String roadId = saved.getKey();
            Road road = map.getRoad(roadId);
            if (road != null) { road.block(); closures.save(roadId, new RoadClosure(roadId, saved.getValue())); }
        }
    }
    public void close(String roadId, String reason) {
        Road road = map.getRoad(roadId);
        if (road == null) throw new RoadNotFoundException(roadId);
        road.block(); closures.save(road.getId(), new RoadClosure(road.getId(), reason));
        persist();
    }
    public void reopen(String roadId) {
        Road road = map.getRoad(roadId);
        if (road == null) throw new RoadNotFoundException(roadId);
        road.reopen(); closures.delete(road.getId()); persist();
    }
    public List<RoadClosure> listClosures() { return new ArrayList<>(closures.findAll()); }
    public List<Road> listOpenRoads() { return map.getRoads().stream().filter(road -> !road.isBlocked()).collect(Collectors.toList()); }
    private void persist() { fileStore.save(closures.findAll()); }
}
