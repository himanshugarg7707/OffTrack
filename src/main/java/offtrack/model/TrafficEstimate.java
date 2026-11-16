package offtrack.model;

public final class TrafficEstimate {
    private final int minutesPerRoad;
    public TrafficEstimate(int minutesPerRoad) { this.minutesPerRoad = Math.max(1, minutesPerRoad); }
    public int getMinutesPerRoad() { return minutesPerRoad; }
}
