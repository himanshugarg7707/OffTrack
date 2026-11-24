package offtrack.service;

import offtrack.model.Route;
import offtrack.model.TrafficEstimate;
import offtrack.model.TravelTime;

public final class ETAEstimator {
    private final TrafficEstimate traffic = new TrafficEstimate(2);
    public TravelTime estimate(Route route) { return new TravelTime(route.getRoadSegmentCount() * traffic.getMinutesPerRoad()); }
}
