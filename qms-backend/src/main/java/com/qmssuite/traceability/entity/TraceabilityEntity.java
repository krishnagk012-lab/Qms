package com.qmssuite.traceability.entity;
import jakarta.persistence.*;import lombok.*;import java.time.Instant;import java.time.LocalDate;import java.util.UUID;
@Entity @Table(name="traceability_chains") @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class TraceabilityEntity {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @Column(name="chain_id",unique=true,nullable=false,length=20) private String chainId;
    @Column(nullable=false,length=150) private String parameter;
    @Column(length=30) private String unit;
    @Column(name="measurement_level",length=150) private String measurementLevel;
    @Column(name="link1_lab",length=150) private String link1Lab;
    @Column(name="link1_cert_no",length=80) private String link1CertNo;
    @Column(name="link1_standard",length=150) private String link1Standard;
    @Column(name="link2_lab",length=150) private String link2Lab;
    @Column(name="link2_cert_no",length=80) private String link2CertNo;
    @Column(name="link2_standard",length=150) private String link2Standard;
    @Column(name="link3_lab",length=150) private String link3Lab;
    @Column(name="link3_standard",length=150) private String link3Standard;
    @Column(name="si_unit",length=80) private String siUnit;
    @Column(name="valid_until") private LocalDate validUntil;
    @Column(name="verified_by",length=120) private String verifiedBy;
    @Column(name="linked_equipment",length=200) private String linkedEquipment;
    @Column(columnDefinition="TEXT") private String notes;
    @Column(name="created_at") private Instant createdAt=Instant.now();
    @Column(name="updated_at") private Instant updatedAt=Instant.now();
}