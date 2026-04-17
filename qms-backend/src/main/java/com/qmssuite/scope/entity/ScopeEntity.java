package com.qmssuite.scope.entity;
import jakarta.persistence.*;import lombok.*;import java.time.Instant;import java.time.LocalDate;import java.util.UUID;
@Entity @Table(name="accreditation_scope") @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ScopeEntity {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @Column(name="scope_id",unique=true,nullable=false,length=20) private String scopeId;
    @Column(name="nabl_cert_no",length=80) private String nablCertNo;
    @Column(nullable=false,length=150) private String parameter;
    @Column(name="method_ref",length=100) private String methodRef;
    @Column(length=100) private String matrix;
    @Column(name="range_from",length=80) private String rangeFrom;
    @Column(name="range_to",length=80) private String rangeTo;
    @Column(length=30) private String unit;
    @Column(length=100) private String uncertainty;
    @Column(length=100) private String facility;
    @Column(name="accredited_since") private LocalDate accreditedSince;
    @Column(name="valid_until") private LocalDate validUntil;
    @Column(length=20) private String status="ACTIVE";
    @Column(name="linked_method_id",length=20) private String linkedMethodId;
    @Column(columnDefinition="TEXT") private String notes;
    @Column(name="created_at") private Instant createdAt=Instant.now();
}