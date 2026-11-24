package offtrack.model;

public final class RouteRequest {
    private final String startId;
    private final String destinationId;
    public RouteRequest(String startId, String destinationId) { this.startId = startId; this.destinationId = destinationId; }
    public String getStartId() { return startId; }
    public String getDestinationId() { return destinationId; }
}
