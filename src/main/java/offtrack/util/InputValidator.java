package offtrack.util;

import offtrack.exception.InvalidInputException;

public final class InputValidator {
    public String required(String value, String label) {
        if (value == null || value.trim().isEmpty()) throw new InvalidInputException(label + " is required.");
        return value.trim();
    }
    public int menuChoice(String value, int minimum, int maximum) {
        try {
            int choice = Integer.parseInt(required(value, "Menu choice"));
            if (choice < minimum || choice > maximum) throw new InvalidInputException("Choose a number from " + minimum + " to " + maximum + ".");
            return choice;
        } catch (NumberFormatException exception) { throw new InvalidInputException("Menu choice must be a number."); }
    }
}
