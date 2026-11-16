package offtrack.ui;

import offtrack.exception.OffTrackException;
import offtrack.model.*;
import offtrack.repository.IncidentRepository;
import offtrack.server.HttpApiServer;
import offtrack.service.*;
import offtrack.util.*;
import java.util.*;

public final class OffTrackConsole {
    private final Scanner scanner = new Scanner(System.in);
    private final ConsoleInput input = new ConsoleInput(scanner);
    private final ConsoleMenu menu = new ConsoleMenu();
    private final InputValidator validator = new InputValidator();
    private final OffTrackConfiguration configuration = new OffTrackConfiguration();
    private final CityMap map = MapLoader.loadCampusSample();
    private final MapService maps = new MapService(map);
    private final RouteService routes = new RouteService(map);
    private final RoadClosureService closures = new RoadClosureService(map, new ClosureFileStore(configuration.closureDataFile()));
    private final IncidentRepository incidentRepository = new IncidentRepository();
    private final DispatchService dispatches = new DispatchService(maps, routes, configuration.medicalCentreId(), incidentRepository);
    private final MapReportService reports = new MapReportService(maps, incidentRepository);
    private final RouteFormatter routeFormatter = new RouteFormatter();
    private final RouteReportService routeReports = new RouteReportService();

    public void run() {
        System.out.println("OffTrack campus emergency navigation | route distances are road segments");
        boolean running = true;
        while (running) {
            menu.show();
            try {
                int choice = validator.menuChoice(scanner.nextLine(), 0, 11);
                switch (choice) {
                    case 1: listLocations(); break;
                    case 2: searchLocations(); break;
                    case 3: findRoute(false); break;
                    case 4: findRoute(true); break;
                    case 5: closeRoad(); break;
                    case 6: reopenRoad(); break;
                    case 7: showClosures(); break;
                    case 8: dispatchAmbulance(); break;
                    case 9: showMapSummary(); break;
                    case 10: showIncidentReport(); break;
                    case 11: startWebServer(); break;
                    case 0: running = false; break;
                    default: break;
                }
            } catch (OffTrackException | IllegalArgumentException exception) {
                System.out.println("Request not completed: " + exception.getMessage());
            }
        }
        System.out.println("OffTrack session ended.");
    }
    private void listLocations() { maps.listLocations().forEach(System.out::println); }
    private void searchLocations() {
        String query = input.read("Search by ID or name: ");
        List<Location> found = maps.searchLocations(query);
        if (found.isEmpty()) System.out.println("No matching locations."); else found.forEach(System.out::println);
    }
    private void findRoute(boolean dfs) {
        String from = input.read("Start location ID: "), to = input.read("Destination location ID: ");
        Route route = routes.find(new RouteRequest(from, to), dfs);
        System.out.println((dfs ? "DFS route: " : "Shortest BFS route: ") + routeFormatter.format(route, map));
        RouteSummary summary = routeReports.summarize(route);
        System.out.println("Road segments: " + route.getRoadSegmentCount() + " | ETA: " + summary.getEta());
    }
    private void closeRoad() {
        printRoads();
        String road = input.read("Road ID to close: ");
        String reason = validator.required(input.read("Reason: "), "Reason");
        closures.close(road, reason);
        System.out.println("Road closed and saved.");
    }
    private void reopenRoad() {
        printRoads();
        closures.reopen(input.read("Road ID to reopen: "));
        System.out.println("Road reopened and saved.");
    }
    private void printRoads() { maps.listRoads().forEach(System.out::println); }
    private void showClosures() {
        List<RoadClosure> active = closures.listClosures();
        if (active.isEmpty()) { System.out.println("No roads are currently closed."); return; }
        active.forEach(closure -> System.out.println(closure.getRoadId() + " | " + closure.getReason() + " | " + closure.getReportedAt()));
    }
    private void dispatchAmbulance() {
        listLocations();
        String location = input.read("Incident location ID: ");
        String description = validator.required(input.read("Incident description: "), "Description");
        Priority priority = readPriority();
        DispatchRecord record = dispatches.dispatch(location, description, priority).getRecord();
        System.out.println("Dispatch confirmed: " + record.getId() + " | " + record.getStatus());
        System.out.println("Vehicle: " + record.getVehicle().getVehicleType() + " " + record.getVehicle().getVehicleId());
        System.out.println("Route to medical centre: " + routeFormatter.format(record.getRoute(), map));
        System.out.println("Estimated arrival: " + record.getEta());
    }
    private Priority readPriority() {
        System.out.println("Priority: 1 Critical | 2 High | 3 Normal");
        switch (validator.menuChoice(input.read("Select priority: "), 1, 3)) {
            case 1: return Priority.CRITICAL;
            case 2: return Priority.HIGH;
            default: return Priority.NORMAL;
        }
    }
    private void showMapSummary() {
        MapStatistics stats = reports.statistics();
        System.out.println("Locations: " + stats.getLocations() + " | Roads: " + stats.getRoads() + " | Blocked roads: " + stats.getBlockedRoads());
    }
    private void showIncidentReport() {
        List<Incident> incidents = reports.incidentsByPriority();
        if (incidents.isEmpty()) { System.out.println("No incidents dispatched this session."); return; }
        incidents.forEach(incident -> System.out.println(incident.getPriority() + " | " + incident.getId() + " | " + incident.getLocationId() + " | " + incident.getDescription()));
    }
    private void startWebServer() {
        try {
            HttpApiServer server = new HttpApiServer(8080);
            server.start();
            System.out.println("Web server started! Open http://localhost:8080 in your browser.");
        } catch (Exception e) {
            System.out.println("Could not start server (port 8080 may already be in use): " + e.getMessage());
        }
    }
}
