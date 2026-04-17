package com.qmssuite.traceability.dto;
import lombok.*;import java.time.Instant;import java.time.LocalDate;import java.util.UUID;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TraceabilityDTO {
    private UUID id;private String chainId,parameter,unit,measurementLevel;
    private String link1Lab,link1CertNo,link1Standard,link2Lab,link2CertNo,link2Standard;
    private String link3Lab,link3Standard,siUnit;
    private LocalDate validUntil;private String verifiedBy,linkedEquipment,notes;
    private Instant createdAt,updatedAt;
}