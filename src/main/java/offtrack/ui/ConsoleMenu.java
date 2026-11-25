package offtrack.ui;

public final class ConsoleMenu {
    public void show() {
        System.out.println("\n=== OFFTRACK ===");
        System.out.println("1. List campus locations\n2. Search locations\n3. Shortest route (BFS)\n4. Alternative route (DFS)");
        System.out.println("5. Close a road\n6. Reopen a road\n7. Show road closures\n8. Dispatch ambulance to medical centre");
        System.out.println("9. Map summary\n10. Incident priority report\n11. Launch Web Server & UI (http://localhost:8080)\n0. Exit");
        System.out.print("Choice: ");
    }
}
