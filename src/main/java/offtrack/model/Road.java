package offtrack.model;

public final class Road {
    private final String id;
    private final String firstLocationId;
    private final String secondLocationId;
    private boolean blocked;

    public Road(String id, String first, String second) {
        this.id = id.trim().toUpperCase();
        this.firstLocationId = first.trim().toUpperCase();
        this.secondLocationId = second.trim().toUpperCase();
        if (this.id.isEmpty() || this.firstLocationId.equals(this.secondLocationId)) throw new IllegalArgumentException("Road needs an ID and two different locations.");
    }
    public String getId() { return id; }
    public String getFirstLocationId() { return firstLocationId; }
    public String getSecondLocationId() { return secondLocationId; }
    public boolean isBlocked() { return blocked; }
    public void block() { blocked = true; }
    public void reopen() { blocked = false; }
    public boolean connects(String locationId) { return firstLocationId.equalsIgnoreCase(locationId) || secondLocationId.equalsIgnoreCase(locationId); }
    public String otherEnd(String locationId) {
        if (firstLocationId.equalsIgnoreCase(locationId)) return secondLocationId;
        if (secondLocationId.equalsIgnoreCase(locationId)) return firstLocationId;
        throw new IllegalArgumentException("Location is not part of road " + id);
    }
    @Override public String toString() { return id + ": " + firstLocationId + " <-> " + secondLocationId + (blocked ? " [CLOSED]" : " [OPEN]"); }
}
