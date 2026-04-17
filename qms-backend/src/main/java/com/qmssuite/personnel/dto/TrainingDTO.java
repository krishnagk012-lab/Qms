package com.qmssuite.personnel.dto;
import lombok.*;import java.time.LocalDate;import java.util.UUID;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TrainingDTO {
    private UUID id;private String trainingId;private String title;private String trainingType;
    private LocalDate dateCompleted;private LocalDate nextDue;private String applicableTo;
    private String status;private String notes;
}