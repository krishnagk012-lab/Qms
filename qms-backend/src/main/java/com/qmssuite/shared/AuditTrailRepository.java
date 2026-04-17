package com.qmssuite.shared;
import org.springframework.data.domain.Page;import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AuditTrailRepository extends JpaRepository<AuditTrailEntity, Long> {
    Page<AuditTrailEntity> findByUsernameOrderByEventTimeDesc(String username, Pageable p);
    Page<AuditTrailEntity> findAllByOrderByEventTimeDesc(Pageable p);
}