package offtrack.repository;

import java.util.*;

public class InMemoryRepository<K, V> implements Repository<K, V> {
    private final Map<K, V> records = new LinkedHashMap<>();
    @Override public Optional<V> findById(K id) { return Optional.ofNullable(records.get(id)); }
    @Override public void save(K id, V value) { records.put(Objects.requireNonNull(id), Objects.requireNonNull(value)); }
    @Override public Collection<V> findAll() { return Collections.unmodifiableCollection(records.values()); }
    @Override public boolean delete(K id) { return records.remove(id) != null; }
}
