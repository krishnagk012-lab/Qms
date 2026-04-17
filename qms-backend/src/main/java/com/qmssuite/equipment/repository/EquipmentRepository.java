package com.qmssuite.equipment.repository;
import com.qmssuite.equipment.entity.EquipmentEntity;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.*;

public interface EquipmentRepository extends JpaRepository<EquipmentEntity, UUID> {
    Optional<EquipmentEntity> findByEqId(String eqId);

    @Query(value = "SELECT * FROM equipment " +
        "WHERE (CAST(:q AS TEXT) IS NULL " +
        "  OR LOWER(name)  LIKE LOWER(CONCAT('%',:q,'%')) " +
        "  OR LOWER(eq_id) LIKE LOWER(CONCAT('%',:q,'%'))) " +
        "AND (CAST(:status   AS TEXT) IS NULL OR status   = :status) " +
        "AND (CAST(:location AS TEXT) IS NULL OR location = :location) " +
        "ORDER BY updated_at DESC",
        countQuery = "SELECT COUNT(*) FROM equipment " +
        "WHERE (CAST(:q AS TEXT) IS NULL " +
        "  OR LOWER(name)  LIKE LOWER(CONCAT('%',:q,'%')) " +
        "  OR LOWER(eq_id) LIKE LOWER(CONCAT('%',:q,'%'))) " +
        "AND (CAST(:status   AS TEXT) IS NULL OR status   = :status) " +
        "AND (CAST(:location AS TEXT) IS NULL OR location = :location)",
        nativeQuery = true)
    Page<EquipmentEntity> search(
        @Param("q")        String q,
        @Param("status")   String status,
        @Param("location") String location,
        Pageable p);

    long countByStatus(String status);
    long countByNextCalBefore(LocalDate date);
    List<EquipmentEntity> findByNextCalBetween(LocalDate from, LocalDate to);
}
