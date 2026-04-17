package com.qmssuite.facilities.repository;
import com.qmssuite.facilities.entity.FacilityEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FacilityRepository extends JpaRepository<FacilityEntity, UUID> {
    Optional<FacilityEntity> findByFacilityId(String facilityId);

    @Query(value = "SELECT * FROM facilities WHERE " +
        "(CAST(:q AS TEXT) IS NULL OR name ILIKE '%' || :q || '%' OR facility_id ILIKE '%' || :q || '%') " +
        "AND (CAST(:status AS TEXT) IS NULL OR status = :status) " +
        "ORDER BY facility_id",
        nativeQuery = true)
    List<FacilityEntity> search(@Param("q") String q, @Param("status") String status);

    long countByStatus(String status);
}
