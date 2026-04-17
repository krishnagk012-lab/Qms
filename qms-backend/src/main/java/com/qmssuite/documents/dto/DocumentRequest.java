package com.qmssuite.documents.dto;
import jakarta.validation.constraints.*;import lombok.Data;import java.time.LocalDate;
@Data public class DocumentRequest {
    @NotBlank @Size(max=30) private String docId;
    @NotBlank @Size(max=200) private String title;
    @NotBlank private String category;
    @NotBlank private String version;
    @NotBlank private String status;
    private LocalDate issueDate;private LocalDate reviewDue;
    private String owner;private String description;
}