package com.qmssuite.suppliers.dto;
import lombok.*;import java.time.Instant;import java.time.LocalDate;import java.util.UUID;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SupplierDTO {
    private UUID id;
    private String supplierId,name,supplierType,contactPerson,email,phone,address;
    private String accreditationNo,accreditationBody,scopeOfSupply;
    private LocalDate accreditationExpiry,evaluationDate,reEvaluationDue;
    private String evaluationStatus,evaluatedBy,evaluationCriteria,status,notes;
    private Instant createdAt,updatedAt;
}