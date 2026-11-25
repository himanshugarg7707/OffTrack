package offtrack.service;

import java.util.concurrent.atomic.AtomicInteger;

public final class DispatchIdGenerator {
    private final AtomicInteger sequence = new AtomicInteger(1);
    private final AtomicInteger incidentSequence = new AtomicInteger(1);
    public String next() { return String.format("DSP-%03d", sequence.getAndIncrement()); }
    public String nextIncident() { return String.format("INC-%03d", incidentSequence.getAndIncrement()); }
}
