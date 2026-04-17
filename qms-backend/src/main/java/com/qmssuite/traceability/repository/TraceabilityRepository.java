package com.qmssuite.traceability.repository;
import com.qmssuite.traceability.entity.TraceabilityEntity;
import org.springframework.data.jpa.repository.JpaRepository;import org.springframework.data.jpa.repository.Query;
import java.util.List;import java.util.Optional;import java.util.UUID;
public interface TraceabilityRepository extends JpaRepository<TraceabilityEntity,UUID> {
    Optional<TraceabilityEntity> findByChainId(String id);
    @Query(value="SELECT * FROM traceability_chains ORDER BY parameter",nativeQuery=true)
    List<TraceabilityEntity> findAllOrdered();
}