package com.qmssuite.samples.dto;
import lombok.*;import java.time.Instant;import java.time.LocalDate;import java.util.UUID;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SampleDTO {
    private UUID id;
    private String sampleId,receivedBy,client,sampleDescription,matrix,quantity;
    private String conditionOnArrival,conditionNotes,storageLocation,storageTemp;
    private String testsRequested,methodReferences,priority,status;
    private String disposalMethod,disposalBy,linkedReport,notes;
    private Instant receivedDate,createdAt;
    private LocalDate disposalDate;
}