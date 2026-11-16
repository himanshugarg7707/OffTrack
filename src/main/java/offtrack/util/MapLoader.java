package offtrack.util;

import offtrack.model.*;

public final class MapLoader {
    private MapLoader() { }
    public static CityMap loadCampusSample() {
        CityMap map = new CityMap();
        map.addLocation(new Location("A", "Main Gate", LocationType.GATE));
        map.addLocation(new Location("B", "Hostel Road", LocationType.HOSTEL));
        map.addLocation(new Location("C", "Academic Block", LocationType.BUILDING));
        map.addLocation(new Location("D", "Library", LocationType.BUILDING));
        map.addLocation(new Location("E", "Sports Complex", LocationType.FACILITY));
        map.addLocation(new Location("F", "Campus Medical Centre", LocationType.MEDICAL_CENTRE));
        map.addRoad(new Road("R1", "A", "B")); map.addRoad(new Road("R2", "A", "C"));
        map.addRoad(new Road("R3", "B", "D")); map.addRoad(new Road("R4", "C", "D"));
        map.addRoad(new Road("R5", "C", "E")); map.addRoad(new Road("R6", "D", "F"));
        map.addRoad(new Road("R7", "E", "F")); map.addRoad(new Road("R8", "B", "C"));
        return map;
    }
}
