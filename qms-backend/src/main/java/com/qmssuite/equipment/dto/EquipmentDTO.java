package com.qmssuite.equipment.dto;
import lombok.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EquipmentDTO {
    private UUID id;
    // Identity (Cl. 6.4.13a)
    private String eqId, name, firmwareVersion, assetTag;
    // Manufacturer (Cl. 6.4.13b)
    private String make, model, serialNo;
    // Verification (Cl. 6.4.13c)
    private LocalDate verificationDate;
    private String verificationBy, acceptanceCriteria;
    // Measurement (Cl. 6.4.5)
    private String measRange, resolution;
    // Location & status (Cl. 6.4.13d)
    private String location, status, calLabelNo;
    // Calibration (Cl. 6.4.13e)
    private LocalDate lastCal, nextCal;
    private String calFrequency, calSource, calCertNo, calResult, correctionFactor, traceabilityStmt;
    // Reference materials (Cl. 6.4.13f)
    private String refMaterial;
    private LocalDate refValidityDate;
    // Maintenance (Cl. 6.4.13g)
    private String maintenancePlan;
    private LocalDate lastMaintenance, nextMaintenance;
    // Damage/modification (Cl. 6.4.13h)
    private String damageHistory;
    // Intermediate checks (Cl. 6.4.10)
    private String intermediateCheck, checkFrequency;
    // Personnel & SOP
    private String assignedTo, sopReference;
    // Purchase
    private LocalDate purchaseDate, commissionedDate;
    private String notes;
    private Instant createdAt, updatedAt;
}
