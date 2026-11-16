package offtrack.server;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import offtrack.model.*;
import offtrack.repository.IncidentRepository;
import offtrack.service.*;
import offtrack.util.*;

import java.io.*;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

/**
 * Embedded HTTP REST API and Static Web Server for OffTrack.
 * Uses Java standard library com.sun.net.httpserver.HttpServer (no external dependencies).
 */
public final class HttpApiServer {
    public static final int DEFAULT_PORT = 8080;

    private final int port;
    private final HttpServer server;
    private final CityMap map;
    private final MapService mapService;
    private final RouteService routeService;
    private final RoadClosureService roadClosureService;
    private final IncidentRepository incidentRepository;
    private final DispatchService dispatchService;
    private final MapReportService mapReportService;
    private final OffTrackConfiguration configuration;
    private final Path webRoot;

    public HttpApiServer(int port) throws IOException {
        this.port = port;
        this.configuration = new OffTrackConfiguration();
        this.map = MapLoader.loadCampusSample();
        this.mapService = new MapService(map);
        this.routeService = new RouteService(map);
        this.roadClosureService = new RoadClosureService(map, new ClosureFileStore(configuration.closureDataFile()));
        this.incidentRepository = new IncidentRepository();
        this.dispatchService = new DispatchService(mapService, routeService, configuration.medicalCentreId(), incidentRepository);
        this.mapReportService = new MapReportService(mapService, incidentRepository);
        this.webRoot = Paths.get("web").toAbsolutePath().normalize();

        this.server = HttpServer.create(new InetSocketAddress(port), 0);
        this.server.setExecutor(Executors.newCachedThreadPool());

        registerRoutes();
    }

    private void registerRoutes() {
        // API routes
        server.createContext("/api/status", new StatusHandler());
        server.createContext("/api/locations", new LocationsHandler());
        server.createContext("/api/roads", new RoadsHandler());
        server.createContext("/api/summary", new SummaryHandler());
        server.createContext("/api/route", new RouteHandler());
        server.createContext("/api/closures", new ClosuresHandler());
        server.createContext("/api/closures/close", new CloseRoadHandler());
        server.createContext("/api/closures/reopen", new ReopenRoadHandler());
        server.createContext("/api/dispatch", new DispatchHandler());
        server.createContext("/api/dispatches", new DispatchesHandler());

        // Static files fallback
        server.createContext("/", new StaticFileHandler());
    }

    public void start() {
        server.start();
        System.out.println("======================================================");
        System.out.println(" OffTrack Web Server running at: http://localhost:" + port);
        System.out.println(" API Endpoints: http://localhost:" + port + "/api/status");
        System.out.println(" Static Web UI: http://localhost:" + port + "/");
        System.out.println("======================================================");
    }

    public void stop() {
        server.stop(0);
        System.out.println("OffTrack Web Server stopped.");
    }

    public static void main(String[] args) {
        int port = DEFAULT_PORT;
        if (args.length > 0) {
            try {
                port = Integer.parseInt(args[0]);
            } catch (NumberFormatException ignored) { }
        }
        try {
            HttpApiServer server = new HttpApiServer(port);
            server.start();
            System.out.println("Press Ctrl+C to terminate.");
        } catch (IOException e) {
            System.err.println("Failed to start server on port " + port + ": " + e.getMessage());
        }
    }

    // ----------------------------------------------------
    // Handlers
    // ----------------------------------------------------

    private class StatusHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handleCors(exchange)) return;
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("status", "ok");
            data.put("application", "OffTrack Emergency Route Navigation");
            data.put("version", "2.0.0");
            data.put("medicalCentreId", configuration.medicalCentreId());
            data.put("mapName", configuration.mapName());
            data.put("timestamp", System.currentTimeMillis());
            sendJsonResponse(exchange, 200, toJson(data));
        }
    }

    private class LocationsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handleCors(exchange)) return;
            List<Map<String, Object>> list = new ArrayList<>();

            // Visual layout coordinates for campus visualization
            Map<String, int[]> coords = new HashMap<>();
            coords.put("A", new int[]{160, 420}); // Main Gate (Bottom-left)
            coords.put("B", new int[]{220, 210}); // Hostel Road (Top-left)
            coords.put("C", new int[]{460, 430}); // Academic Block (Bottom-center)
            coords.put("D", new int[]{520, 200}); // Library (Top-center)
            coords.put("E", new int[]{780, 420}); // Sports Complex (Bottom-right)
            coords.put("F", new int[]{800, 190}); // Campus Medical Centre (Top-right)

            for (Location loc : map.getLocations()) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", loc.getId());
                item.put("name", loc.getName());
                item.put("type", loc.getType().name());
                item.put("isMedicalCentre", loc.getId().equalsIgnoreCase(configuration.medicalCentreId()));
                int[] c = coords.getOrDefault(loc.getId(), new int[]{300, 300});
                item.put("x", c[0]);
                item.put("y", c[1]);
                list.add(item);
            }
            sendJsonResponse(exchange, 200, toJson(list));
        }
    }

    private class RoadsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handleCors(exchange)) return;
            List<Map<String, Object>> list = new ArrayList<>();
            for (Road road : map.getRoads()) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", road.getId());
                item.put("from", road.getFirstLocationId());
                item.put("to", road.getSecondLocationId());
                item.put("blocked", road.isBlocked());
                list.add(item);
            }
            sendJsonResponse(exchange, 200, toJson(list));
        }
    }

    private class SummaryHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handleCors(exchange)) return;
            MapStatistics stats = mapReportService.statistics();
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("locations", stats.getLocations());
            data.put("roads", stats.getRoads());
            data.put("blockedRoads", stats.getBlockedRoads());
            data.put("activeClosures", roadClosureService.listClosures().size());
            data.put("totalDispatches", dispatchService.history().size());
            data.put("medicalCentreId", configuration.medicalCentreId());
            data.put("mapName", configuration.mapName());
            sendJsonResponse(exchange, 200, toJson(data));
        }
    }

    private class RouteHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handleCors(exchange)) return;
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
                return;
            }

            String body = readRequestBody(exchange);
            Map<String, String> req = parseSimpleJson(body);
            String from = req.get("from");
            String to = req.get("to");
            boolean dfs = "dfs".equalsIgnoreCase(req.get("algorithm"));

            if (from == null || to == null || from.trim().isEmpty() || to.trim().isEmpty()) {
                sendJsonResponse(exchange, 400, "{\"error\":\"Start and destination locations are required.\"}");
                return;
            }

            try {
                Route route = routeService.find(new RouteRequest(from, to), dfs);
                Map<String, Object> res = new LinkedHashMap<>();
                res.put("found", true);
                res.put("from", from.toUpperCase());
                res.put("to", to.toUpperCase());
                res.put("algorithm", dfs ? "DFS" : "BFS");
                res.put("path", route.getLocationIds());
                res.put("roadSegments", route.getRoadSegmentCount());
                res.put("travelTimeMinutes", route.getRoadSegmentCount() * 2);
                res.put("formatted", new RouteFormatter().format(route, map));
                sendJsonResponse(exchange, 200, toJson(res));
            } catch (Exception e) {
                Map<String, Object> res = new LinkedHashMap<>();
                res.put("found", false);
                res.put("from", from.toUpperCase());
                res.put("to", to.toUpperCase());
                res.put("error", e.getMessage());
                sendJsonResponse(exchange, 200, toJson(res));
            }
        }
    }

    private class ClosuresHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handleCors(exchange)) return;
            List<Map<String, Object>> list = new ArrayList<>();
            for (RoadClosure closure : roadClosureService.listClosures()) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("roadId", closure.getRoadId());
                item.put("reason", closure.getReason());
                item.put("reportedAt", closure.getReportedAt().toString());
                list.add(item);
            }
            sendJsonResponse(exchange, 200, toJson(list));
        }
    }

    private class CloseRoadHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handleCors(exchange)) return;
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
                return;
            }

            String body = readRequestBody(exchange);
            Map<String, String> req = parseSimpleJson(body);
            String roadId = req.get("roadId");
            String reason = req.getOrDefault("reason", "Reported obstacle / safety closure");

            if (roadId == null || roadId.trim().isEmpty()) {
                sendJsonResponse(exchange, 400, "{\"error\":\"roadId is required.\"}");
                return;
            }

            try {
                roadClosureService.close(roadId.trim(), reason);
                Map<String, Object> res = new LinkedHashMap<>();
                res.put("success", true);
                res.put("roadId", roadId.toUpperCase());
                res.put("blocked", true);
                res.put("reason", reason);
                sendJsonResponse(exchange, 200, toJson(res));
            } catch (Exception e) {
                sendJsonResponse(exchange, 400, "{\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
            }
        }
    }

    private class ReopenRoadHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handleCors(exchange)) return;
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
                return;
            }

            String body = readRequestBody(exchange);
            Map<String, String> req = parseSimpleJson(body);
            String roadId = req.get("roadId");

            if (roadId == null || roadId.trim().isEmpty()) {
                sendJsonResponse(exchange, 400, "{\"error\":\"roadId is required.\"}");
                return;
            }

            try {
                roadClosureService.reopen(roadId.trim());
                Map<String, Object> res = new LinkedHashMap<>();
                res.put("success", true);
                res.put("roadId", roadId.toUpperCase());
                res.put("blocked", false);
                sendJsonResponse(exchange, 200, toJson(res));
            } catch (Exception e) {
                sendJsonResponse(exchange, 400, "{\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
            }
        }
    }

    private class DispatchHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handleCors(exchange)) return;
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
                return;
            }

            String body = readRequestBody(exchange);
            Map<String, String> req = parseSimpleJson(body);
            String locationId = req.get("locationId");
            String description = req.getOrDefault("description", "Medical Emergency");
            String prioStr = req.getOrDefault("priority", "CRITICAL").toUpperCase();
            Priority priority;
            try {
                priority = Priority.valueOf(prioStr);
            } catch (IllegalArgumentException e) {
                priority = Priority.CRITICAL;
            }

            if (locationId == null || locationId.trim().isEmpty()) {
                sendJsonResponse(exchange, 400, "{\"error\":\"locationId is required.\"}");
                return;
            }

            try {
                DispatchReceipt receipt = dispatchService.dispatch(locationId.trim(), description, priority);
                DispatchRecord record = receipt.getRecord();
                Map<String, Object> res = new LinkedHashMap<>();
                res.put("success", true);
                res.put("id", record.getId());
                res.put("status", record.getStatus().name());
                res.put("vehicle", record.getVehicle().getVehicleType() + " " + record.getVehicle().getVehicleId());
                res.put("priority", priority.name());
                res.put("incidentLocation", locationId.toUpperCase());
                res.put("destination", configuration.medicalCentreId());
                res.put("description", description);
                res.put("path", record.getRoute().getLocationIds());
                res.put("segments", record.getRoute().getRoadSegmentCount());
                res.put("etaMinutes", record.getEta().getEstimatedMinutes());
                res.put("etaString", record.getEta().toString());
                sendJsonResponse(exchange, 200, toJson(res));
            } catch (Exception e) {
                sendJsonResponse(exchange, 400, "{\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
            }
        }
    }

    private class DispatchesHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handleCors(exchange)) return;
            List<Map<String, Object>> list = new ArrayList<>();
            for (DispatchRecord record : dispatchService.history()) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", record.getId());
                item.put("status", record.getStatus().name());
                item.put("vehicle", record.getVehicle().getVehicleType() + " " + record.getVehicle().getVehicleId());
                item.put("incidentId", record.getIncident().getId());
                item.put("locationId", record.getIncident().getLocationId());
                item.put("description", record.getIncident().getDescription());
                item.put("priority", record.getIncident().getPriority().name());
                item.put("path", record.getRoute().getLocationIds());
                item.put("etaMinutes", record.getEta().getEstimatedMinutes());
                item.put("reportedAt", record.getIncident().getReportedAt().toString());
                list.add(item);
            }
            sendJsonResponse(exchange, 200, toJson(list));
        }
    }

    private class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (handleCors(exchange)) return;
            URI uri = exchange.getRequestURI();
            String pathStr = uri.getPath();
            if (pathStr == null || pathStr.equals("/")) {
                pathStr = "/index.html";
            }

            // Sanitize path against directory traversal
            Path target = webRoot.resolve(pathStr.substring(1)).normalize();
            if (!target.startsWith(webRoot) || !Files.exists(target) || Files.isDirectory(target)) {
                // If not found in web/, try index.html
                target = webRoot.resolve("index.html");
                if (!Files.exists(target)) {
                    String err = "<h1>404 Not Found</h1><p>Web UI files not found at: " + webRoot + "</p>";
                    byte[] bytes = err.getBytes(StandardCharsets.UTF_8);
                    exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
                    exchange.sendResponseHeaders(404, bytes.length);
                    try (OutputStream os = exchange.getResponseBody()) { os.write(bytes); }
                    return;
                }
            }

            String contentType = probeContentType(target.getFileName().toString());
            byte[] fileBytes = Files.readAllBytes(target);
            exchange.getResponseHeaders().set("Content-Type", contentType);
            exchange.getResponseHeaders().set("Cache-Control", "no-cache, no-store, must-revalidate");
            exchange.sendResponseHeaders(200, fileBytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(fileBytes);
            }
        }
    }

    // ----------------------------------------------------
    // Utilities
    // ----------------------------------------------------

    private boolean handleCors(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return true;
        }
        return false;
    }

    private void sendJsonResponse(HttpExchange exchange, int status, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private String readRequestBody(HttpExchange exchange) throws IOException {
        try (InputStream is = exchange.getRequestBody();
             BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            return reader.lines().collect(Collectors.joining("\n"));
        }
    }

    private String probeContentType(String filename) {
        String name = filename.toLowerCase();
        if (name.endsWith(".html") || name.endsWith(".htm")) return "text/html; charset=UTF-8";
        if (name.endsWith(".css")) return "text/css; charset=UTF-8";
        if (name.endsWith(".js") || name.endsWith(".mjs")) return "application/javascript; charset=UTF-8";
        if (name.endsWith(".json")) return "application/json; charset=UTF-8";
        if (name.endsWith(".svg")) return "image/svg+xml";
        if (name.endsWith(".png")) return "image/png";
        if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
        if (name.endsWith(".ico")) return "image/x-icon";
        return "application/octet-stream";
    }

    @SuppressWarnings("unchecked")
    private String toJson(Object obj) {
        if (obj == null) return "null";
        if (obj instanceof String) return "\"" + escapeJson((String) obj) + "\"";
        if (obj instanceof Number || obj instanceof Boolean) return obj.toString();
        if (obj instanceof Map) {
            Map<?, ?> map = (Map<?, ?>) obj;
            StringBuilder sb = new StringBuilder("{");
            boolean first = true;
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                if (!first) sb.append(",");
                sb.append("\"").append(escapeJson(String.valueOf(entry.getKey()))).append("\":");
                sb.append(toJson(entry.getValue()));
                first = false;
            }
            sb.append("}");
            return sb.toString();
        }
        if (obj instanceof Collection) {
            Collection<?> col = (Collection<?>) obj;
            StringBuilder sb = new StringBuilder("[");
            boolean first = true;
            for (Object item : col) {
                if (!first) sb.append(",");
                sb.append(toJson(item));
                first = false;
            }
            sb.append("]");
            return sb.toString();
        }
        return "\"" + escapeJson(obj.toString()) + "\"";
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private Map<String, String> parseSimpleJson(String json) {
        Map<String, String> result = new LinkedHashMap<>();
        if (json == null || json.trim().isEmpty()) return result;
        String trimmed = json.trim();
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            trimmed = trimmed.substring(1, trimmed.length() - 1);
        }
        // Split by top-level commas
        String[] pairs = trimmed.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
        for (String pair : pairs) {
            String[] kv = pair.split(":(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", 2);
            if (kv.length == 2) {
                String key = cleanJsonToken(kv[0]);
                String val = cleanJsonToken(kv[1]);
                result.put(key, val);
            }
        }
        return result;
    }

    private String cleanJsonToken(String token) {
        String t = token.trim();
        if (t.startsWith("\"") && t.endsWith("\"") && t.length() >= 2) {
            t = t.substring(1, t.length() - 1);
        }
        return t.replace("\\\"", "\"").replace("\\\\", "\\");
    }
}
