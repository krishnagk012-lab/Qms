package com.qmssuite.auth.repository;
import com.qmssuite.auth.entity.OrganisationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface OrganisationRepository extends JpaRepository<OrganisationEntity, UUID> {
    boolean existsByName(String name);
}
