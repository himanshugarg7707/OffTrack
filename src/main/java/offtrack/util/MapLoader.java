package offtrack.util;

import offtrack.model.CityMap;
import offtrack.model.Location;
import offtrack.model.LocationType;
import offtrack.model.Road;

/** Loads the rough, named Chitkara campus network used by the demo. */
public final class MapLoader {
    private MapLoader() { }

    public static CityMap loadCampusSample() {
        CityMap map = new CityMap();
        map.addLocation(new Location("A", "Main Gate", LocationType.GATE));
        map.addLocation(new Location("B", "Pie Girls Hostel", LocationType.HOSTEL));
        map.addLocation(new Location("C", "Le Corbusier Block", LocationType.BUILDING));
        map.addLocation(new Location("D", "Library", LocationType.BUILDING));
        map.addLocation(new Location("E", "Turing Block", LocationType.BUILDING));
        map.addLocation(new Location("F", "Neelam Hospital", LocationType.MEDICAL_CENTRE));
        map.addLocation(new Location("G", "Martin Luther Block", LocationType.BUILDING));
        map.addLocation(new Location("H", "Rockefeller Block", LocationType.BUILDING));
        map.addLocation(new Location("I", "Newton Block", LocationType.BUILDING));
        map.addLocation(new Location("J", "De Morgan Block", LocationType.BUILDING));
        map.addLocation(new Location("K", "Einstein Hall (Galileo Block)", LocationType.BUILDING));
        map.addLocation(new Location("L", "Pythagoras Block", LocationType.BUILDING));
        map.addLocation(new Location("M", "Galileo Block", LocationType.BUILDING));
        map.addLocation(new Location("N", "Park", LocationType.PARK));
        map.addLocation(new Location("O", "Hall", LocationType.HALL));
        map.addLocation(new Location("P", "Square 1 Food Court", LocationType.FOOD_COURT));
        map.addLocation(new Location("Q", "Boys Hostel", LocationType.HOSTEL));
        map.addLocation(new Location("R", "Exploratorium", LocationType.FACILITY));
        map.addLocation(new Location("S", "Sportorium", LocationType.FACILITY));
        map.addLocation(new Location("T", "Football Ground", LocationType.FACILITY));
        map.addLocation(new Location("U", "Volleyball Court", LocationType.FACILITY));
        map.addLocation(new Location("V", "Edison Block", LocationType.BUILDING));
        map.addLocation(new Location("W", "Fleming Block", LocationType.BUILDING));
        map.addLocation(new Location("X", "Admissions Block", LocationType.BUILDING));
        map.addLocation(new Location("Y", "T-point", LocationType.JUNCTION));

        // Shared campus corridors form a connected backbone with a few alternate loops.
        addRoad(map, "R1", "A", "H");
        addRoad(map, "R2", "H", "G");
        addRoad(map, "R3", "G", "Q");
        addRoad(map, "R6", "M", "K");
        addRoad(map, "R7", "K", "E");
        addRoad(map, "R8", "E", "D");
        addRoad(map, "R9", "D", "F");
        addRoad(map, "R10", "D", "N");
        addRoad(map, "R11", "N", "I");
        addRoad(map, "R12", "I", "J");
        addRoad(map, "R13", "J", "O");
        addRoad(map, "R14", "O", "P");
        addRoad(map, "R15", "P", "L");
        addRoad(map, "R16", "L", "A");
        addRoad(map, "R17", "D", "C");
        addRoad(map, "R18", "C", "X");
        addRoad(map, "R19", "E", "V");
        addRoad(map, "R20", "E", "W");
        addRoad(map, "R21", "L", "U");
        addRoad(map, "R22", "U", "T");
        addRoad(map, "R23", "T", "S");
        addRoad(map, "R24", "S", "R");
        addRoad(map, "R25", "C", "E");
        addRoad(map, "R26", "V", "I");
        addRoad(map, "R27", "B", "Y");
        addRoad(map, "R28", "Y", "G");
        addRoad(map, "R29", "Y", "P");
        addRoad(map, "R30", "C", "L");
        return map;
    }

    private static void addRoad(CityMap map, String id, String from, String to) {
        map.addRoad(new Road(id, from, to));
    }
}
