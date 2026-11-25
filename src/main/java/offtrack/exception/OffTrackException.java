package offtrack.exception;

public class OffTrackException extends RuntimeException {
    public OffTrackException(String message) { super(message); }
    public OffTrackException(String message, Throwable cause) { super(message, cause); }
}
