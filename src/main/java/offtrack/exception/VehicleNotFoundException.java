package offtrack.exception;

public final class VehicleNotFoundException extends OffTrackException {
    public VehicleNotFoundException(String id) { super("Vehicle not found: " + id); }
}
