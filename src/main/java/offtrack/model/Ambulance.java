package offtrack.model;

public final class Ambulance extends EmergencyVehicle {
    public Ambulance(String id) { super(id); }
    @Override public String getVehicleType() { return "Ambulance"; }
}
