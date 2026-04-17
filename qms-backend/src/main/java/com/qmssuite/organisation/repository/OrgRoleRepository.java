package com.qmssuite.organisation.repository;
import com.qmssuite.organisation.entity.OrgRoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;import org.springframework.data.jpa.repository.Query;
import java.util.List;import java.util.Optional;import java.util.UUID;
public interface OrgRoleRepository extends JpaRepository<OrgRoleEntity,UUID> {
    Optional<OrgRoleEntity> findByRoleId(String id);
    @Query(value="SELECT * FROM organisation_roles ORDER BY role_id",nativeQuery=true)
    List<OrgRoleEntity> findAllOrdered();
}