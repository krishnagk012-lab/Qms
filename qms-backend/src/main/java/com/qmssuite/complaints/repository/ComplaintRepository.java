package com.qmssuite.complaints.repository;
import com.qmssuite.complaints.entity.ComplaintEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;import java.util.Optional;import java.util.UUID;
public interface ComplaintRepository extends JpaRepository<ComplaintEntity,UUID> {
    Optional<ComplaintEntity> findByComplaintId(String id);
    @Query(value="SELECT * FROM complaints WHERE (CAST(:q AS TEXT) IS NULL OR complainant ILIKE '%'||:q||'%' OR description ILIKE '%'||:q||'%') AND (CAST(:status AS TEXT) IS NULL OR status=:status) ORDER BY received_date DESC",nativeQuery=true)
    List<ComplaintEntity> search(@Param("q") String q,@Param("status") String status);
    long countByStatus(String s);
}