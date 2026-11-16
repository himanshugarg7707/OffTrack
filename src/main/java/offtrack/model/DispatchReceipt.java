package offtrack.model;

public final class DispatchReceipt {
    private final DispatchRecord record;
    public DispatchReceipt(DispatchRecord record) { this.record = record; }
    public DispatchRecord getRecord() { return record; }
}
