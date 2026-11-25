package offtrack;

import offtrack.server.HttpApiServer;
import offtrack.ui.OffTrackConsole;

public class Main {
    public static void main(String[] args) {
        if (args.length > 0 && (args[0].equalsIgnoreCase("--web") || args[0].equalsIgnoreCase("--server"))) {
            HttpApiServer.main(new String[0]);
            return;
        }
        new OffTrackConsole().run();
    }
}
