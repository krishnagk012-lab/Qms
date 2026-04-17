package com.qmssuite.samples.entity;
import jakarta.persistence.*;import lombok.*;import java.time.Instant;import java.time.LocalDate;import java.util.UUID;
@Entity @Table(name="samples") @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class SampleEntity {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @Column(name="sample_id",unique=true,nullable=false,length=30) private String sampleId;
    @Column(name="received_date") private Instant receivedDate=Instant.now();
    @Column(name="received_by",length=120) private String receivedBy;
    @Column(length=150) private String client;
    @Column(name="sample_description",columnDefinition="TEXT") private String sampleDescription;
    @Column(length=80) private String matrix;
    @Column(length=60) private String quantity;
    @Column(name="condition_on_arrival",length=30) private String conditionOnArrival="ACCEPTABLE";
    @Column(name="condition_notes",columnDefinition="TEXT") private String conditionNotes;
    @Column(name="storage_location",length=80) private String storageLocation;
    @Column(name="storage_temp",length=30) private String storageTemp;
    @Column(name="tests_requested",columnDefinition="TEXT") private String testsRequested;
    @Column(name="method_references",columnDefinition="TEXT") private String methodReferences;
    @Column(length=20) private String priority="NORMAL";
    @Column(length=20) private String status="RECEIVED";
    @Column(name="disposal_date") private LocalDate disposalDate;
    @Column(name="disposal_method",length=80) private String disposalMethod;
    @Column(name="disposal_by",length=120) private String disposalBy;
    @Column(name="linked_report",length=50) private String linkedReport;
    @Column(columnDefinition="TEXT") private String notes;
    @Column(name="created_at") private Instant createdAt=Instant.now();
}