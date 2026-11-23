package offtrack.model;

public final class DispatchRecord {
    private final String id;
    private final Incident incident;
    private final EmergencyVehicle vehicle;
    private final Route route;
    private final TravelTime eta;
    private DispatchStatus status;
    public DispatchRecord(String id, Incident incident, EmergencyVehicle vehicle, Route route, TravelTime eta) {
        this.id = id; this.incident = incident; this.vehicle = vehicle; this.route = route; this.eta = eta; this.status = DispatchStatus.DISPATCHED;
    }
    public String getId() { return id; }
    public Incident getIncident() { return incident; }
    public EmergencyVehicle getVehicle() { return vehicle; }
    public Route getRoute() { return route; }
    public TravelTime getEta() { return eta; }
    public DispatchStatus getStatus() { return status; }
    public void complete() { status = DispatchStatus.COMPLETED; }
}
