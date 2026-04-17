package com.qmssuite.facilities.repository;
import com.qmssuite.facilities.entity.EnvReadingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface EnvReadingRepository extends JpaRepository<EnvReadingEntity, UUID> {

    @Query(value = "SELECT * FROM env_readings WHERE facility_id = :fid ORDER BY recorded_at DESC LIMIT 200",
           nativeQuery = true)
    List<EnvReadingEntity> findByFacilityId(@Param("fid") String facilityId);

    @Query(value = "SELECT * FROM env_readings WHERE facility_id = :fid " +
        "AND recorded_at BETWEEN :from AND :to ORDER BY recorded_at DESC",
        nativeQuery = true)
    List<EnvReadingEntity> findByFacilityIdAndRange(
        @Param("fid") String facilityId,
        @Param("from") Instant from, @Param("to") Instant to);

    @Query(value = "SELECT * FROM env_readings WHERE within_limits = false ORDER BY recorded_at DESC LIMIT 100",
           nativeQuery = true)
    List<EnvReadingEntity> findDeviations();

    @Query(value = "SELECT * FROM env_readings WHERE facility_id = :fid ORDER BY recorded_at DESC LIMIT 1",
           nativeQuery = true)
    List<EnvReadingEntity> findLatestByFacilityId(@Param("fid") String facilityId);
}
