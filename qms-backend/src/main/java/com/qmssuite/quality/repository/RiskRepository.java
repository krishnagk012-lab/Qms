package com.qmssuite.quality.repository;
import com.qmssuite.quality.entity.RiskEntity;
import org.springframework.data.jpa.repository.JpaRepository;import java.util.*;
public interface RiskRepository extends JpaRepository<RiskEntity, UUID> {
    Optional<RiskEntity> findByRiskId(String riskId);
    long countByLevel(String level);long countByStatus(String status);
}