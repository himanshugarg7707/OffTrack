package offtrack.model;

import java.util.Comparator;

public final class IncidentPriorityComparator implements Comparator<Incident> {
    @Override public int compare(Incident first, Incident second) {
        int byPriority = first.getPriority().compareTo(second.getPriority());
        return byPriority != 0 ? byPriority : first.getReportedAt().compareTo(second.getReportedAt());
    }
}
