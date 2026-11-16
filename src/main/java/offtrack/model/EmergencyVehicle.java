package offtrack.model;

public abstract class EmergencyVehicle {
    private final String vehicleId;
    protected EmergencyVehicle(String vehicleId) { this.vehicleId = vehicleId; }
    public String getVehicleId() { return vehicleId; }
    public abstract String getVehicleType();
}
