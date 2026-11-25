package offtrack.service;

import offtrack.model.Route;
import offtrack.model.RouteSummary;

public final class RouteReportService {
    private final ETAEstimator eta = new ETAEstimator();
    public RouteSummary summarize(Route route) { return new RouteSummary(route, eta.estimate(route)); }
}
