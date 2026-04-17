package com.qmssuite.auth.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface SystemConfigRepository extends JpaRepository<SystemConfigEntry, String> {
    @Query(value="SELECT value FROM system_config WHERE key=:key", nativeQuery=true)
    String findValue(@Param("key") String key);

    @Modifying @Transactional
    @Query(value="UPDATE system_config SET value=:value WHERE key=:key", nativeQuery=true)
    void setValue(@Param("key") String key, @Param("value") String value);
}
