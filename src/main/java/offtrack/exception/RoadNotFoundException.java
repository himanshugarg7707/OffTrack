package offtrack.exception;

public final class RoadNotFoundException extends OffTrackException {
    public RoadNotFoundException(String id) { super("Road not found: " + id); }
}
