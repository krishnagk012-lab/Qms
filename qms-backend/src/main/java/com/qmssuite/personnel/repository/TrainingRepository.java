package com.qmssuite.personnel.repository;
import com.qmssuite.personnel.entity.TrainingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;import java.util.*;
public interface TrainingRepository extends JpaRepository<TrainingEntity, UUID> {
    List<TrainingEntity> findByNextDueBefore(LocalDate date);
    long countByStatus(String status);
}