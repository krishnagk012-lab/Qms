package com.qmssuite.facilities.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name="env_readings")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class EnvReadingEntity {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @Column(name="facility_id",nullable=false,length=20) private String facilityId;
    @Column(name="recorded_at") private Instant recordedAt = Instant.now();
    @Column(name="recorded_by",length=120) private String recordedBy;
    private BigDecimal temperature, humidity, pressure;
    @Column(name="co2_ppm")     private BigDecimal co2Ppm;
    private BigDecimal particulates, vibration;
    @Column(name="lighting_lux") private BigDecimal lightingLux;
    @Column(name="other_value") private BigDecimal otherValue;
    @Column(name="other_label",length=60) private String otherLabel;
    @Column(name="within_limits") private Boolean withinLimits = true;
    @Column(name="deviation_notes",columnDefinition="TEXT") private String deviationNotes;
    @Column(name="ncr_reference",length=30) private String ncrReference;
}
