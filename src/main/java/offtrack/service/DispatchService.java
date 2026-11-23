package offtrack.service;

import offtrack.exception.DispatchException;
import offtrack.model.*;
import offtrack.repository.*;

public final class DispatchService {
    private final MapService maps;
    private final RouteService routes;
    private final DispatchRepository dispatches = new DispatchRepository();
    private final IncidentRepository incidents;
    private final DispatchIdGenerator ids = new DispatchIdGenerator();
    private final ETAEstimator eta = new ETAEstimator();
    private final String medicalCentreId;
    public DispatchService(MapService maps, RouteService routes, String medicalCentreId, IncidentRepository incidents) {
        this.maps = maps; this.routes = routes; this.medicalCentreId = medicalCentreId; this.incidents = incidents;
    }
    public DispatchReceipt dispatch(String locationId, String description, Priority priority) {
        maps.requireLocation(locationId); maps.requireLocation(medicalCentreId);
        Incident incident = new Incident(ids.nextIncident(), locationId, description, priority);
        try {
            Route route = routes.shortest(locationId, medicalCentreId);
            DispatchRecord record = new DispatchRecord(ids.next(), incident, new Ambulance("AMB-01"), route, eta.estimate(route));
            incidents.save(incident.getId(), incident); dispatches.save(record.getId(), record);
            return new DispatchReceipt(record);
        } catch (RuntimeException exception) {
            if (exception instanceof DispatchException) throw exception;
            throw new DispatchException("Could not dispatch: " + exception.getMessage());
        }
    }
    public java.util.Collection<DispatchRecord> history() { return dispatches.findAll(); }
}
