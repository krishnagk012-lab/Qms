package com.qmssuite.management.dto;
import lombok.*;import java.time.Instant;import java.time.LocalDate;import java.util.UUID;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ManagementReviewDTO {
    private UUID id;
    private String reviewId,chairedBy,attendees;
    private LocalDate reviewDate,nextReviewDate,approvedDate;
    private String inputPolicyObjectives,inputPreviousActions,inputRecentResults,inputNonconformities;
    private String inputProficiency,inputRiskActions,inputWorkload,inputComplaints,inputResources;
    private String inputSupplier,inputAuditFindings,inputExternalChanges;
    private String outputQmsEffectiveness,outputImprovements,outputResourceNeeds,outputActionItems;
    private String status,approvedBy,notes;
    private Instant createdAt;
}