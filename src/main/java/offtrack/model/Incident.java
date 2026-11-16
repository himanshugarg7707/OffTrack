package offtrack.model;

import java.time.LocalDateTime;

public final class Incident {
    private final String id;
    private final String locationId;
    private final String description;
    private final Priority priority;
    private final LocalDateTime reportedAt;
    public Incident(String id, String locationId, String description, Priority priority) {
        if (description == null || description.trim().isEmpty()) throw new IllegalArgumentException("Incident description is required.");
        this.id = id; this.locationId = locationId.trim().toUpperCase(); this.description = description.trim();
        this.priority = priority; this.reportedAt = LocalDateTime.now();
    }
    public String getId() { return id; }
    public String getLocationId() { return locationId; }
    public String getDescription() { return description; }
    public Priority getPriority() { return priority; }
    public LocalDateTime getReportedAt() { return reportedAt; }
}
