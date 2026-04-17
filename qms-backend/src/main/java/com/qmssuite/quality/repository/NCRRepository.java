package com.qmssuite.quality.repository;
import com.qmssuite.quality.entity.NCREntity;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface NCRRepository extends JpaRepository<NCREntity, UUID> {
    Optional<NCREntity> findByNcrId(String ncrId);

    @Query(value = "SELECT * FROM ncrs " +
        "WHERE (CAST(:q AS TEXT) IS NULL " +
        "  OR LOWER(finding) LIKE LOWER(CONCAT('%',:q,'%'))) " +
        "AND (CAST(:status AS TEXT) IS NULL OR status = :status) " +
        "AND (CAST(:area   AS TEXT) IS NULL OR area   = :area) " +
        "ORDER BY created_at DESC",
        countQuery = "SELECT COUNT(*) FROM ncrs " +
        "WHERE (CAST(:q AS TEXT) IS NULL " +
        "  OR LOWER(finding) LIKE LOWER(CONCAT('%',:q,'%'))) " +
        "AND (CAST(:status AS TEXT) IS NULL OR status = :status) " +
        "AND (CAST(:area   AS TEXT) IS NULL OR area   = :area)",
        nativeQuery = true)
    Page<NCREntity> search(
        @Param("q")      String q,
        @Param("status") String status,
        @Param("area")   String area,
        Pageable p);

    long countByStatus(String status);
}
