package com.qmssuite.facilities.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name="facilities")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class FacilityEntity {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @Column(name="facility_id",unique=true,nullable=false,length=20) private String facilityId;
    @Column(nullable=false,length=150) private String name;
    @Column(name="facility_type",nullable=false,length=30) private String facilityType;
    @Column(length=100) private String location;
    @Column(name="area_sqm") private BigDecimal areaSqm;

    // Cl. 6.3.2
    @Column(name="activities_performed",columnDefinition="TEXT") private String activitiesPerformed;
    @Column(name="documented_requirements",columnDefinition="TEXT") private String documentedRequirements;

    // Cl. 6.3.3 — what to monitor
    @Column(name="monitor_temperature")  private Boolean monitorTemperature  = false;
    @Column(name="monitor_humidity")     private Boolean monitorHumidity     = false;
    @Column(name="monitor_pressure")     private Boolean monitorPressure     = false;
    @Column(name="monitor_co2")          private Boolean monitorCo2          = false;
    @Column(name="monitor_particulates") private Boolean monitorParticulates = false;
    @Column(name="monitor_vibration")    private Boolean monitorVibration    = false;
    @Column(name="monitor_lighting")     private Boolean monitorLighting     = false;
    @Column(name="monitor_other",length=200) private String monitorOther;

    // Limits
    @Column(name="temp_min")     private BigDecimal tempMin;
    @Column(name="temp_max")     private BigDecimal tempMax;
    @Column(name="temp_unit",length=5) private String tempUnit = "°C";
    @Column(name="humidity_min") private BigDecimal humidityMin;
    @Column(name="humidity_max") private BigDecimal humidityMax;

    // Cl. 6.3.4
    @Column(name="access_control",length=30) private String accessControl;
    @Column(name="access_requirements",columnDefinition="TEXT") private String accessRequirements;
    @Column(name="contamination_controls",columnDefinition="TEXT") private String contaminationControls;
    @Column(name="separation_measures",columnDefinition="TEXT") private String separationMeasures;
    @Column(name="incompatible_areas",length=200) private String incompatibleAreas;

    // Cl. 6.3.5
    @Column(name="is_external_site") private Boolean isExternalSite = false;
    @Column(name="external_site_address",length=300) private String externalSiteAddress;
    @Column(name="external_compliance_notes",columnDefinition="TEXT") private String externalComplianceNotes;

    @Column(length=20) private String status = "ACTIVE";
    @Column(name="responsible_person",length=120) private String responsiblePerson;
    @Column(columnDefinition="TEXT") private String notes;
    @Column(name="created_at") private Instant createdAt = Instant.now();
    @Column(name="updated_at") private Instant updatedAt = Instant.now();
}
