package com.qmssuite.equipment.dto;
import lombok.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EquipmentHistoryDTO {
    private UUID id;
    private String eqId;
    private String eventType;
    private LocalDate eventDate;
    private String performedBy;
    private String recordedBy;
    private Instant recordedAt;
    // Calibration
    private String calCertNo, calAgency, calResult, correctionFactor, traceability;
    private LocalDate calDueDate;
    // Maintenance
    private String workDone, partsReplaced;
    private LocalDate nextDueDate;
    // General
    private String description, impact, actionTaken, ncrReference;
    private String statusBefore, statusAfter;
    private Boolean resultsAffected, reVerified;
    private String reVerifiedBy;
    private LocalDate reVerifiedDate;
    private String certFileRef;
}
