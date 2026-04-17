package com.qmssuite.management.repository;
import com.qmssuite.management.entity.ManagementReviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;import java.util.Optional;import java.util.UUID;
public interface ManagementReviewRepository extends JpaRepository<ManagementReviewEntity,UUID> {
    Optional<ManagementReviewEntity> findByReviewId(String id);
    @Query(value="SELECT * FROM management_reviews ORDER BY review_date DESC",nativeQuery=true)
    List<ManagementReviewEntity> findAllOrdered();
}