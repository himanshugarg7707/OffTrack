package offtrack.repository;

import java.util.Collection;
import java.util.Optional;

public interface Repository<K, V> {
    Optional<V> findById(K id);
    void save(K id, V value);
    Collection<V> findAll();
    boolean delete(K id);
}
