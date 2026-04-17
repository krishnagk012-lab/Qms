package com.qmssuite.testing.dto;
import lombok.*;import java.math.BigDecimal;import java.time.LocalDate;import java.util.UUID;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PTResultDTO {
    private UUID id;private String resultId;private UUID schemeId;private String roundNo;
    private BigDecimal assignedValue;private BigDecimal labResult;private BigDecimal uncertainty;
    private BigDecimal stdDev;private BigDecimal zScore;private String status;
    private LocalDate submissionDate;private String analyst;private String notes;
    private String zStatus;
}