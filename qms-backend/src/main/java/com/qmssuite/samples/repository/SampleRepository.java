package com.qmssuite.samples.repository;
import com.qmssuite.samples.entity.SampleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;import java.util.Optional;import java.util.UUID;
public interface SampleRepository extends JpaRepository<SampleEntity,UUID> {
    Optional<SampleEntity> findBySampleId(String id);
    @Query(value="SELECT * FROM samples WHERE (CAST(:q AS TEXT) IS NULL OR sample_id ILIKE '%'||:q||'%' OR client ILIKE '%'||:q||'%') AND (CAST(:status AS TEXT) IS NULL OR status=:status) ORDER BY created_at DESC",nativeQuery=true)
    List<SampleEntity> search(@Param("q") String q,@Param("status") String status);
    long countByStatus(String s);
}