package com.qmssuite.methods.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity @Table(name="methods")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class MethodEntity {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @Column(name="method_id",unique=true,nullable=false,length=20) private String methodId;
    @Column(nullable=false,length=200) private String title;
    @Column(name="method_type",nullable=false,length=20) private String methodType;
    @Column(name="standard_ref",length=100) private String standardRef;
    @Column(length=150) private String parameter;
    @Column(length=100) private String matrix;
    @Column(columnDefinition="TEXT") private String scope;
    @Column(name="accreditation_status",length=20) private String accreditationStatus = "PENDING";
    @Column(name="selection_basis",columnDefinition="TEXT") private String selectionBasis;
    @Column(name="applicable_to",columnDefinition="TEXT") private String applicableTo;
    @Column(name="validation_type",length=20) private String validationType;
    @Column(name="validation_status",length=20) private String validationStatus = "NOT_DONE";
    @Column(name="validation_date") private LocalDate validationDate;
    @Column(name="validated_by",length=120) private String validatedBy;
    @Column(name="validation_ref",length=80) private String validationRef;
    @Column(name="val_linearity") private Boolean valLinearity = false;
    @Column(name="val_precision") private Boolean valPrecision = false;
    @Column(name="val_accuracy")  private Boolean valAccuracy  = false;
    @Column(name="val_selectivity") private Boolean valSelectivity = false;
    @Column(name="val_lod_loq")   private Boolean valLodLoq   = false;
    @Column(name="val_ruggedness") private Boolean valRuggedness = false;
    @Column(name="val_uncertainty") private Boolean valUncertainty = false;
    @Column(name="working_range",length=100) private String workingRange;
    @Column(length=60) private String lod;
    @Column(length=60) private String loq;
    @Column(name="precision_rsd",length=60) private String precisionRsd;
    @Column(name="bias_percent",length=60) private String biasPercent;
    @Column(name="uncertainty_k2",length=100) private String uncertaintyK2;
    @Column(name="required_equipment",columnDefinition="TEXT") private String requiredEquipment;
    @Column(name="required_reagents",columnDefinition="TEXT") private String requiredReagents;
    @Column(name="deviations_approved",columnDefinition="TEXT") private String deviationsApproved;
    @Column(name="sop_reference",length=80) private String sopReference;
    @Column(name="responsible_person",length=120) private String responsiblePerson;
    @Column(length=20) private String status = "ACTIVE";
    @Column(name="effective_date") private LocalDate effectiveDate;
    @Column(name="review_date") private LocalDate reviewDate;
    @Column(columnDefinition="TEXT") private String notes;
    @Column(name="created_at") private Instant createdAt = Instant.now();
    @Column(name="updated_at") private Instant updatedAt = Instant.now();
}
