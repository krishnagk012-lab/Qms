package com.qmssuite.methods.dto;
import lombok.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MethodDTO {
    private UUID id;
    private String methodId, title, methodType, standardRef, parameter, matrix, scope;
    private String accreditationStatus, selectionBasis, applicableTo;
    private String validationType, validationStatus, validatedBy, validationRef;
    private LocalDate validationDate;
    private Boolean valLinearity, valPrecision, valAccuracy, valSelectivity,
                    valLodLoq, valRuggedness, valUncertainty;
    private String workingRange, lod, loq, precisionRsd, biasPercent, uncertaintyK2;
    private String requiredEquipment, requiredReagents, deviationsApproved;
    private String sopReference, responsiblePerson, status, notes;
    private LocalDate effectiveDate, reviewDate;
    private Instant createdAt, updatedAt;
}
