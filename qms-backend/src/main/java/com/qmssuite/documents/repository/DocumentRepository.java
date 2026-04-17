package com.qmssuite.documents.repository;
import com.qmssuite.documents.entity.DocumentEntity;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.*;

public interface DocumentRepository extends JpaRepository<DocumentEntity, UUID> {
    Optional<DocumentEntity> findByDocId(String docId);

    @Query(value = "SELECT * FROM documents " +
        "WHERE (CAST(:search AS TEXT) IS NULL " +
        "  OR LOWER(doc_id) LIKE LOWER(CONCAT('%',:search,'%')) " +
        "  OR LOWER(title)  LIKE LOWER(CONCAT('%',:search,'%'))) " +
        "AND (CAST(:category AS TEXT) IS NULL OR category = :category) " +
        "AND (CAST(:status   AS TEXT) IS NULL OR status   = :status) " +
        "ORDER BY updated_at DESC",
        countQuery = "SELECT COUNT(*) FROM documents " +
        "WHERE (CAST(:search AS TEXT) IS NULL " +
        "  OR LOWER(doc_id) LIKE LOWER(CONCAT('%',:search,'%')) " +
        "  OR LOWER(title)  LIKE LOWER(CONCAT('%',:search,'%'))) " +
        "AND (CAST(:category AS TEXT) IS NULL OR category = :category) " +
        "AND (CAST(:status   AS TEXT) IS NULL OR status   = :status)",
        nativeQuery = true)
    Page<DocumentEntity> search(
        @Param("search")   String search,
        @Param("category") String category,
        @Param("status")   String status,
        Pageable p);

    long countByStatus(String status);
    long countByReviewDueBefore(LocalDate date);
}
