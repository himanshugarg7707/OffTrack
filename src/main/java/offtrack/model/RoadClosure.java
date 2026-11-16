package offtrack.model;

import java.time.LocalDateTime;

public final class RoadClosure {
    private final String roadId;
    private final String reason;
    private final LocalDateTime reportedAt;
    public RoadClosure(String roadId, String reason) {
        this.roadId = roadId; this.reason = reason; this.reportedAt = LocalDateTime.now();
    }
    public String getRoadId() { return roadId; }
    public String getReason() { return reason; }
    public LocalDateTime getReportedAt() { return reportedAt; }
}
