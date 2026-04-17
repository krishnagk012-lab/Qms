package com.qmssuite.equipment.entity;
import com.qmssuite.shared.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity @Table(name="equipment") @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class EquipmentEntity extends BaseEntity {
    // ── Cl. 6.4.13(a) Identity ─────────────────────────────────────────────
    @Column(name="eq_id",unique=true,nullable=false,length=20) private String eqId;
    @Column(nullable=false,length=150) private String name;
    @Column(name="firmware_version",length=50) private String firmwareVersion;
    @Column(name="asset_tag",length=50) private String assetTag;

    // ── Cl. 6.4.13(b) Manufacturer identification ──────────────────────────
    @Column(length=80) private String make;
    @Column(length=80) private String model;
    @Column(name="serial_no",length=80) private String serialNo;

    // ── Cl. 6.4.4 / 6.4.13(c) Verification ────────────────────────────────
    @Column(name="verification_date") private LocalDate verificationDate;
    @Column(name="verification_by",length=120) private String verificationBy;
    @Column(name="acceptance_criteria",columnDefinition="TEXT") private String acceptanceCriteria;

    // ── Cl. 6.4.5 Measurement range & resolution ───────────────────────────
    @Column(name="meas_range",length=100) private String measRange;
    @Column(length=60) private String resolution;

    // ── Cl. 6.4.13(d) Location & status ────────────────────────────────────
    @Column(length=60) private String location;
    @Column(nullable=false,length=30) private String status;
    @Column(name="cal_label_no",length=50) private String calLabelNo;

    // ── Cl. 6.4.13(e) Calibration ──────────────────────────────────────────
    @Column(name="last_cal") private LocalDate lastCal;
    @Column(name="next_cal") private LocalDate nextCal;
    @Column(name="cal_frequency",length=20) private String calFrequency;
    @Column(name="cal_source",length=120) private String calSource;
    @Column(name="cal_cert_no",length=80) private String calCertNo;
    @Column(name="cal_result",length=30) private String calResult;
    @Column(name="correction_factor",length=100) private String correctionFactor;
    @Column(name="traceability_stmt",columnDefinition="TEXT") private String traceabilityStmt;

    // ── Cl. 6.4.13(f) Reference materials ──────────────────────────────────
    @Column(name="ref_material",length=200) private String refMaterial;
    @Column(name="ref_validity_date") private LocalDate refValidityDate;

    // ── Cl. 6.4.13(g) Maintenance ──────────────────────────────────────────
    @Column(name="maintenance_plan",columnDefinition="TEXT") private String maintenancePlan;
    @Column(name="last_maintenance") private LocalDate lastMaintenance;
    @Column(name="next_maintenance") private LocalDate nextMaintenance;

    // ── Cl. 6.4.13(h) Damage / modification history ────────────────────────
    @Column(name="damage_history",columnDefinition="TEXT") private String damageHistory;

    // ── Cl. 6.4.10 Intermediate checks ─────────────────────────────────────
    @Column(name="intermediate_check",columnDefinition="TEXT") private String intermediateCheck;
    @Column(name="check_frequency",length=30) private String checkFrequency;

    // ── Personnel & SOP (NABL assessor expectation) ─────────────────────────
    @Column(name="assigned_to",length=120) private String assignedTo;
    @Column(name="sop_reference",length=80) private String sopReference;

    // ── Purchase / commissioning ─────────────────────────────────────────────
    @Column(name="purchase_date") private LocalDate purchaseDate;
    @Column(name="commissioned_date") private LocalDate commissionedDate;

    @Column(columnDefinition="TEXT") private String notes;
}
