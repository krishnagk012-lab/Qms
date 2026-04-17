package com.qmssuite.reports.repository;
import com.qmssuite.reports.entity.ReportEntity;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface ReportRepository extends JpaRepository<ReportEntity, UUID> {
    Optional<ReportEntity> findByReportNo(String reportNo);

    @Query(value = "SELECT * FROM reports " +
        "WHERE (CAST(:q AS TEXT) IS NULL " +
        "  OR LOWER(report_no) LIKE LOWER(CONCAT('%',:q,'%')) " +
        "  OR LOWER(test_name) LIKE LOWER(CONCAT('%',:q,'%')) " +
        "  OR LOWER(client)    LIKE LOWER(CONCAT('%',:q,'%'))) " +
        "AND (CAST(:status AS TEXT) IS NULL OR status = :status) " +
        "ORDER BY created_at DESC",
        countQuery = "SELECT COUNT(*) FROM reports " +
        "WHERE (CAST(:q AS TEXT) IS NULL " +
        "  OR LOWER(report_no) LIKE LOWER(CONCAT('%',:q,'%')) " +
        "  OR LOWER(test_name) LIKE LOWER(CONCAT('%',:q,'%')) " +
        "  OR LOWER(client)    LIKE LOWER(CONCAT('%',:q,'%'))) " +
        "AND (CAST(:status AS TEXT) IS NULL OR status = :status)",
        nativeQuery = true)
    Page<ReportEntity> search(
        @Param("q")      String q,
        @Param("status") String status,
        Pageable p);

    long countByStatus(String status);
}
