package com.qmssuite.quality.dto;
import lombok.*;import java.time.Instant;import java.util.UUID;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RiskDTO {
    private UUID id;private String riskId;private String description;private String area;
    private Integer likelihood;private Integer impact;private Integer riskScore;
    private String level;private String treatment;private String status;private String controlMeasure;
    private Instant createdAt;private Instant updatedAt;
}