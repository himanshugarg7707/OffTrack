package offtrack.model;

public final class TravelTime {
    private final int estimatedMinutes;
    public TravelTime(int estimatedMinutes) { this.estimatedMinutes = Math.max(0, estimatedMinutes); }
    public int getEstimatedMinutes() { return estimatedMinutes; }
    @Override public String toString() { return estimatedMinutes + " min (sample estimate)"; }
}
