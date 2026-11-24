package offtrack.service;

import offtrack.model.*;
import offtrack.repository.IncidentRepository;
import java.util.*;
import java.util.stream.Collectors;

public final class MapReportService {
    private final MapService maps;
    private final IncidentRepository incidents;
    public MapReportService(MapService maps, IncidentRepository incidents) { this.maps = maps; this.incidents = incidents; }
    public MapStatistics statistics() { return maps.statistics(); }
    public List<Incident> incidentsByPriority() {
        return incidents.findAll().stream().sorted(new IncidentPriorityComparator()).collect(Collectors.toList());
    }
}
