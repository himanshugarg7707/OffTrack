package offtrack.util;

import offtrack.exception.StorageException;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.Base64;
import java.util.stream.Collectors;

public final class ClosureFileStore {
    private final Path file;
    public ClosureFileStore(Path file) { this.file = file; }
    public Map<String, String> load() {
        if (!Files.exists(file)) return Collections.emptyMap();
        try {
            Map<String, String> saved = new LinkedHashMap<>();
            for (String line : Files.readAllLines(file, StandardCharsets.UTF_8)) {
                if (line.trim().isEmpty()) continue;
                String[] parts = line.split("\\|", 2);
                String roadId = parts[0].trim().toUpperCase();
                String reason = parts.length == 2
                        ? new String(Base64.getDecoder().decode(parts[1]), StandardCharsets.UTF_8)
                        : "Restored saved closure";
                saved.put(roadId, reason);
            }
            return saved;
        } catch (IOException exception) { throw new StorageException("Could not read saved road closures.", exception); }
    }
    public void save(Collection<offtrack.model.RoadClosure> closures) {
        try {
            Path parent = file.getParent();
            if (parent != null) Files.createDirectories(parent);
            List<String> lines = new ArrayList<>();
            for (offtrack.model.RoadClosure closure : closures) {
                String reason = Base64.getEncoder().encodeToString(closure.getReason().getBytes(StandardCharsets.UTF_8));
                lines.add(closure.getRoadId() + "|" + reason);
            }
            Files.write(file, lines, StandardCharsets.UTF_8, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
        } catch (IOException exception) { throw new StorageException("Could not save road closures.", exception); }
    }
}
