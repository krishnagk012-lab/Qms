package com.qmssuite.testing.dto;
import lombok.*;import java.time.Instant;import java.time.LocalDate;import java.util.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TestRecordDTO {
    private UUID id;private String testId;private String testName;private String sampleId;
    private String client;private LocalDate startDate;private LocalDate endDate;
    private String analyst;private String result;private String stage;private String method;
    private Map<String,Object> parameters;private String notes;
    private Instant createdAt;private Instant updatedAt;
}