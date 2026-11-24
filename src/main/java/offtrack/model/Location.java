package offtrack.model;

import java.util.Objects;

public final class Location {
    private final String id;
    private String name;
    private final LocationType type;

    public Location(String id, String name, LocationType type) {
        this.id = Objects.requireNonNull(id).trim().toUpperCase();
        this.name = Objects.requireNonNull(name).trim();
        this.type = Objects.requireNonNull(type);
        if (this.id.isEmpty() || this.name.isEmpty()) throw new IllegalArgumentException("Location ID and name are required.");
    }
    public String getId() { return id; }
    public String getName() { return name; }
    public LocationType getType() { return type; }
    public void rename(String name) {
        if (name == null || name.trim().isEmpty()) throw new IllegalArgumentException("Location name cannot be empty.");
        this.name = name.trim();
    }
    @Override public String toString() { return id + " - " + name + " (" + type + ")"; }
}
