package com.qmssuite.auth.repository;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="system_config")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SystemConfigEntry {
    @Id @Column(length=60) private String key;
    @Column(nullable=false) private String value;
}
