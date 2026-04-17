package com.qmssuite.testing.repository;
import com.qmssuite.testing.entity.TestRecordEntity;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface TestRecordRepository extends JpaRepository<TestRecordEntity, UUID> {
    Optional<TestRecordEntity> findByTestId(String testId);

    @Query(value = "SELECT * FROM test_records " +
        "WHERE (CAST(:q AS TEXT) IS NULL " +
        "  OR LOWER(test_name) LIKE LOWER(CONCAT('%',:q,'%')) " +
        "  OR LOWER(client)    LIKE LOWER(CONCAT('%',:q,'%'))) " +
        "AND (CAST(:result AS TEXT) IS NULL OR result = :result) " +
        "AND (CAST(:stage  AS TEXT) IS NULL OR stage  = :stage) " +
        "ORDER BY created_at DESC",
        countQuery = "SELECT COUNT(*) FROM test_records " +
        "WHERE (CAST(:q AS TEXT) IS NULL " +
        "  OR LOWER(test_name) LIKE LOWER(CONCAT('%',:q,'%')) " +
        "  OR LOWER(client)    LIKE LOWER(CONCAT('%',:q,'%'))) " +
        "AND (CAST(:result AS TEXT) IS NULL OR result = :result) " +
        "AND (CAST(:stage  AS TEXT) IS NULL OR stage  = :stage)",
        nativeQuery = true)
    Page<TestRecordEntity> search(
        @Param("q")      String q,
        @Param("result") String result,
        @Param("stage")  String stage,
        Pageable p);

    long countByStage(String stage);
    long countByResult(String result);
}
