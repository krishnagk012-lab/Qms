package com.qmssuite.facilities.dto;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EnvReadingDTO {
    private UUID id;
    private String facilityId;
    private Instant recordedAt;
    private String recordedBy;
    private BigDecimal temperature, humidity, pressure, co2Ppm, particulates, vibration, lightingLux, otherValue;
    private String otherLabel;
    private Boolean withinLimits;
    private String deviationNotes, ncrReference;
}
