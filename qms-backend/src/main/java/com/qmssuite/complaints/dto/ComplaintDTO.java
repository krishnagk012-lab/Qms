package com.qmssuite.complaints.dto;
import lombok.*;import java.time.Instant;import java.time.LocalDate;import java.util.UUID;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ComplaintDTO {
    private UUID id;
    private String complaintId,complainant,contact,complaintType,description,relatedReport;
    private String severity,status,assignedTo,investigation,rootCause,correctiveAction,ncrReference;
    private LocalDate receivedDate,responseDate,closedDate;
    private Boolean responseSent;
    private Instant createdAt,updatedAt;
}