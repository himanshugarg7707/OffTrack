package offtrack.model;

public final class RouteSummary {
    private final Route route;
    private final TravelTime eta;
    public RouteSummary(Route route, TravelTime eta) { this.route = route; this.eta = eta; }
    public Route getRoute() { return route; }
    public TravelTime getEta() { return eta; }
}
