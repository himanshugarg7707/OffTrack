package offtrack.service;

import offtrack.model.*;

public final class DispatchReportFormatter {
    private final RouteFormatter routes = new RouteFormatter();
    public String format(DispatchRecord record, CityMap map) {
        return record.getId() + " | " + record.getStatus() + " | " + record.getIncident().getPriority()
                + " | " + record.getIncident().getDescription() + " at " + record.getIncident().getLocationId()
                + " | " + routes.format(record.getRoute(), map) + " | ETA " + record.getEta();
    }
}
