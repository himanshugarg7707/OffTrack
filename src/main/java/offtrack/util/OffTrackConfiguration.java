package offtrack.util;

import java.nio.file.Path;
import java.nio.file.Paths;

public final class OffTrackConfiguration {
    public String mapName() { return "Chitkara University sample map"; }
    public String medicalCentreId() { return "F"; }
    public Path closureDataFile() { return Paths.get("data", "blocked-roads.txt"); }
}
