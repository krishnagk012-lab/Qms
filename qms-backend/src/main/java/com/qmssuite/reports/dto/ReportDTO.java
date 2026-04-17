package com.qmssuite.reports.dto;
import lombok.*;import java.time.Instant;import java.time.LocalDate;import java.util.UUID;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ReportDTO {
    private UUID id;private String reportNo;private String reportType;private String testName;
    private String sampleId;private String client;private LocalDate issueDate;
    private String analyst;private String authorisedBy;private String status;
    private String validity;private String pdfPath;private String uncertaintyStmt;
    private Instant createdAt;private Instant updatedAt;
    private boolean hasPdf;
}