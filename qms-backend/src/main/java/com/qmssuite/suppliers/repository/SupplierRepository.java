package com.qmssuite.suppliers.repository;
import com.qmssuite.suppliers.entity.SupplierEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;import java.util.Optional;import java.util.UUID;
public interface SupplierRepository extends JpaRepository<SupplierEntity,UUID> {
    Optional<SupplierEntity> findBySupplierId(String supplierId);
    @Query(value="SELECT * FROM suppliers WHERE (CAST(:q AS TEXT) IS NULL OR name ILIKE '%'||:q||'%') AND (CAST(:type AS TEXT) IS NULL OR supplier_type=:type) AND (CAST(:status AS TEXT) IS NULL OR status=:status) ORDER BY supplier_id",nativeQuery=true)
    List<SupplierEntity> search(@Param("q") String q,@Param("type") String type,@Param("status") String status);
    long countByEvaluationStatus(String s);
}