package com.qmssuite.methods.repository;
import com.qmssuite.methods.entity.MethodEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MethodRepository extends JpaRepository<MethodEntity, UUID> {
    Optional<MethodEntity> findByMethodId(String methodId);

    @Query(value = "SELECT * FROM methods WHERE " +
        "(CAST(:q AS TEXT) IS NULL OR title ILIKE '%'||:q||'%' OR method_id ILIKE '%'||:q||'%' OR parameter ILIKE '%'||:q||'%') " +
        "AND (CAST(:type AS TEXT) IS NULL OR method_type = :type) " +
        "AND (CAST(:status AS TEXT) IS NULL OR status = :status) " +
        "ORDER BY method_id", nativeQuery = true)
    List<MethodEntity> search(@Param("q") String q, @Param("type") String type, @Param("status") String status);

    long countByStatus(String status);
    long countByValidationStatus(String validationStatus);
    long countByAccreditationStatus(String accreditationStatus);
}
