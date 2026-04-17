package com.qmssuite.suppliers.entity;
import jakarta.persistence.*;import lombok.*;import java.time.Instant;import java.time.LocalDate;import java.util.UUID;
@Entity @Table(name="suppliers") @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class SupplierEntity {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @Column(name="supplier_id",unique=true,nullable=false,length=20) private String supplierId;
    @Column(nullable=false,length=150) private String name;
    @Column(name="supplier_type",nullable=false,length=30) private String supplierType;
    @Column(name="contact_person",length=120) private String contactPerson;
    @Column(length=120) private String email;
    @Column(length=30) private String phone;
    @Column(columnDefinition="TEXT") private String address;
    @Column(name="accreditation_no",length=80) private String accreditationNo;
    @Column(name="accreditation_body",length=80) private String accreditationBody;
    @Column(name="accreditation_expiry") private LocalDate accreditationExpiry;
    @Column(name="scope_of_supply",columnDefinition="TEXT") private String scopeOfSupply;
    @Column(name="evaluation_status",length=20) private String evaluationStatus="PENDING";
    @Column(name="evaluation_date") private LocalDate evaluationDate;
    @Column(name="evaluated_by",length=120) private String evaluatedBy;
    @Column(name="evaluation_criteria",columnDefinition="TEXT") private String evaluationCriteria;
    @Column(name="re_evaluation_due") private LocalDate reEvaluationDue;
    @Column(length=20) private String status="ACTIVE";
    @Column(columnDefinition="TEXT") private String notes;
    @Column(name="created_at") private Instant createdAt=Instant.now();
    @Column(name="updated_at") private Instant updatedAt=Instant.now();
}