package offtrack.service;

import offtrack.model.CityMap;
import offtrack.model.Route;

public interface RouteStrategy { Route find(CityMap map, String startId, String destinationId); }
