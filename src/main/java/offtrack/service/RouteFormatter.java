package offtrack.service;

import offtrack.model.CityMap;
import offtrack.model.Location;
import offtrack.model.Route;
import java.util.stream.Collectors;

public final class RouteFormatter {
    public String format(Route route, CityMap map) {
        return route.getLocationIds().stream().map(id -> {
            Location location = map.getLocation(id);
            return location == null ? id : location.getName();
        }).collect(Collectors.joining(" -> "));
    }
}
