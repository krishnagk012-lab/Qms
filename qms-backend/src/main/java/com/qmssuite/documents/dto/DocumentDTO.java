package com.qmssuite.documents.dto;
import lombok.*;import java.time.Instant;import java.time.LocalDate;import java.util.UUID;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DocumentDTO {
    private UUID id;private String docId;private String title;private String category;
    private String version;private String status;private LocalDate issueDate;
    private LocalDate reviewDue;private String owner;private String description;
    private Instant createdAt;private Instant updatedAt;
}