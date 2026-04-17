package com.qmssuite.auth.entity;
import com.qmssuite.shared.BaseEntity;
import jakarta.persistence.*;import lombok.*;
import java.time.Instant;
@Entity @Table(name="users") @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class UserEntity extends BaseEntity {
    @Column(unique=true,nullable=false,length=50) private String username;
    @Column(name="full_name",nullable=false,length=120) private String fullName;
    @Column(nullable=false,length=20) private String role;
    @Column(length=80) private String department;
    @Column(unique=true,length=120) private String email;
    @Column(name="password_hash",nullable=false,length=255) private String passwordHash;
    @Column(name="is_active",nullable=false) private boolean isActive=true;
    @Column(name="last_login") private Instant lastLogin;
    @Column(name="org_id") private java.util.UUID orgId;
}