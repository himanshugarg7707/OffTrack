package offtrack.ui;

import java.util.Scanner;

public final class ConsoleInput {
    private final Scanner scanner;
    public ConsoleInput(Scanner scanner) { this.scanner = scanner; }
    public String read(String prompt) { System.out.print(prompt); return scanner.nextLine().trim(); }
}
