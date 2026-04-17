package com.qmssuite.quality.dto;
import lombok.*;import java.time.Instant;import java.time.LocalDate;import java.util.UUID;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class NCRDTO {
    private UUID id;private String ncrId;private String finding;private String area;
    private String severity;private String status;private LocalDate raisedDate;
    private String assignee;private LocalDate dueDate;private String rootCause;
    private String correctiveAction;private LocalDate closedDate;
    private Instant createdAt;private Instant updatedAt;
}