package offtrack.exception;

public final class NoRouteException extends OffTrackException {
    public NoRouteException(String from, String to) { super("No open route found from " + from + " to " + to + "."); }
}
