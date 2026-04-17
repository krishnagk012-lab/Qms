package com.qmssuite.testing.repository;
import com.qmssuite.testing.entity.PTResultEntity;
import org.springframework.data.jpa.repository.JpaRepository;import java.util.*;
public interface PTResultRepository extends JpaRepository<PTResultEntity, UUID> {
    List<PTResultEntity> findBySchemeIdOrderByCreatedAtDesc(UUID schemeId);
    long countByStatus(String status);
}