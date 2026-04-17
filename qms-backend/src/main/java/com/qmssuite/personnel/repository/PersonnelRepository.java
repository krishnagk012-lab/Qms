package com.qmssuite.personnel.repository;
import com.qmssuite.personnel.entity.PersonnelEntity;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface PersonnelRepository extends JpaRepository<PersonnelEntity, UUID> {
    Optional<PersonnelEntity> findByEmpId(String empId);

    @Query(value = "SELECT * FROM personnel " +
        "WHERE (CAST(:q AS TEXT) IS NULL " +
        "  OR LOWER(full_name) LIKE LOWER(CONCAT('%',:q,'%')) " +
        "  OR LOWER(emp_id)    LIKE LOWER(CONCAT('%',:q,'%'))) " +
        "AND (CAST(:dept   AS TEXT) IS NULL OR department = :dept) " +
        "AND (CAST(:status AS TEXT) IS NULL OR status     = :status) " +
        "ORDER BY full_name ASC",
        countQuery = "SELECT COUNT(*) FROM personnel " +
        "WHERE (CAST(:q AS TEXT) IS NULL " +
        "  OR LOWER(full_name) LIKE LOWER(CONCAT('%',:q,'%')) " +
        "  OR LOWER(emp_id)    LIKE LOWER(CONCAT('%',:q,'%'))) " +
        "AND (CAST(:dept   AS TEXT) IS NULL OR department = :dept) " +
        "AND (CAST(:status AS TEXT) IS NULL OR status     = :status)",
        nativeQuery = true)
    Page<PersonnelEntity> search(
        @Param("q")      String q,
        @Param("dept")   String dept,
        @Param("status") String status,
        Pageable p);

    long countByStatus(String status);
}
