# OffTrack (terminal version)

A beginner-friendly Java console demo for emergency route finding. The sample map represents a small campus network; replace its locations and roads in `MapLoader` to use another map.

## Requirements

- Java JDK 8 or newer

## Run

From this folder:

```sh
javac Main.java
java Main
```

Choose **2** to find a shortest route using BFS, **3** to find a route using DFS, or **4** to mark a road as blocked. Location IDs are shown in the location list. Routes currently count road segments; real distance and traffic data are not included.

The source is intentionally kept in one file so it is easy to compile and present in a beginner project. It contains more than 30 small classes and interfaces demonstrating basic OOP organization alongside graph, queue, stack, and traversal concepts.
