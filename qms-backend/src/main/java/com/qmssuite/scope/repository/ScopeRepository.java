package com.qmssuite.scope.repository;
import com.qmssuite.scope.entity.ScopeEntity;
import org.springframework.data.jpa.repository.JpaRepository;import org.springframework.data.jpa.repository.Query;
import java.util.List;import java.util.Optional;import java.util.UUID;
public interface ScopeRepository extends JpaRepository<ScopeEntity,UUID> {
    Optional<ScopeEntity> findByScopeId(String id);
    @Query(value="SELECT * FROM accreditation_scope ORDER BY parameter",nativeQuery=true)
    List<ScopeEntity> findAllOrdered();
}