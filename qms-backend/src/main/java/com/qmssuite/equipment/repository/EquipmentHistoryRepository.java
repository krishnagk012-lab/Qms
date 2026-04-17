package com.qmssuite.equipment.repository;
import com.qmssuite.equipment.entity.EquipmentHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface EquipmentHistoryRepository extends JpaRepository<EquipmentHistoryEntity, UUID> {

    @Query(value = "SELECT * FROM equipment_history WHERE eq_id = :eqId ORDER BY event_date DESC, recorded_at DESC",
           nativeQuery = true)
    List<EquipmentHistoryEntity> findAllByEqId(@Param("eqId") String eqId);

    @Query(value = "SELECT * FROM equipment_history WHERE eq_id = :eqId AND event_type = :type ORDER BY event_date DESC",
           nativeQuery = true)
    List<EquipmentHistoryEntity> findByEqIdAndType(@Param("eqId") String eqId, @Param("type") String type);

    @Query(value = "SELECT * FROM equipment_history WHERE eq_id = :eqId AND event_date BETWEEN :from AND :to ORDER BY event_date DESC",
           nativeQuery = true)
    List<EquipmentHistoryEntity> findByEqIdAndDateRange(
        @Param("eqId") String eqId,
        @Param("from") LocalDate from,
        @Param("to")   LocalDate to);

    @Query(value = "SELECT * FROM equipment_history WHERE eq_id = :eqId AND event_type = 'CALIBRATION' ORDER BY event_date DESC",
           nativeQuery = true)
    List<EquipmentHistoryEntity> findCalibrationHistory(@Param("eqId") String eqId);
}
