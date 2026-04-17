package com.qmssuite.facilities.dto;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class FacilityDTO {
    private UUID id;
    private String facilityId, name, facilityType, location;
    private BigDecimal areaSqm;
    private String activitiesPerformed, documentedRequirements;
    private Boolean monitorTemperature, monitorHumidity, monitorPressure,
                    monitorCo2, monitorParticulates, monitorVibration, monitorLighting;
    private String monitorOther;
    private BigDecimal tempMin, tempMax, humidityMin, humidityMax;
    private String tempUnit, accessControl, accessRequirements,
                   contaminationControls, separationMeasures, incompatibleAreas;
    private Boolean isExternalSite;
    private String externalSiteAddress, externalComplianceNotes;
    private String status, responsiblePerson, notes;
    private Instant createdAt, updatedAt;
}
