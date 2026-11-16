package offtrack.exception;

public final class LocationNotFoundException extends OffTrackException {
    public LocationNotFoundException(String id) { super("Location not found: " + id); }
}
