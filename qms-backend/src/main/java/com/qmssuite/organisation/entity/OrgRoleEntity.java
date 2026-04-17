package com.qmssuite.organisation.entity;
import jakarta.persistence.*;import lombok.*;import java.time.Instant;import java.time.LocalDate;import java.util.UUID;
@Entity @Table(name="organisation_roles") @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class OrgRoleEntity {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @Column(name="role_id",unique=true,nullable=false,length=20) private String roleId;
    @Column(name="role_title",nullable=false,length=100) private String roleTitle;
    @Column(name="iso_ref",length=20) private String isoRef;
    @Column(length=120) private String incumbent;
    @Column(name="emp_id",length=20) private String empId;
    @Column(columnDefinition="TEXT") private String responsibilities;
    @Column(columnDefinition="TEXT") private String authorities;
    @Column(name="appointed_by",length=120) private String appointedBy;
    @Column(name="appointment_date") private LocalDate appointmentDate;
    @Column(length=120) private String deputy;
    @Column(name="created_at") private Instant createdAt=Instant.now();
}