package com.qmssuite.complaints.entity;
import jakarta.persistence.*;import lombok.*;import java.time.Instant;import java.time.LocalDate;import java.util.UUID;
@Entity @Table(name="complaints") @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ComplaintEntity {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @Column(name="complaint_id",unique=true,nullable=false,length=20) private String complaintId;
    @Column(name="received_date",nullable=false) private LocalDate receivedDate;
    @Column(length=150) private String complainant;
    @Column(length=120) private String contact;
    @Column(name="complaint_type",length=30) private String complaintType;
    @Column(nullable=false,columnDefinition="TEXT") private String description;
    @Column(name="related_report",length=50) private String relatedReport;
    @Column(length=20) private String severity="MEDIUM";
    @Column(length=20) private String status="OPEN";
    @Column(name="assigned_to",length=120) private String assignedTo;
    @Column(columnDefinition="TEXT") private String investigation;
    @Column(name="root_cause",columnDefinition="TEXT") private String rootCause;
    @Column(name="corrective_action",columnDefinition="TEXT") private String correctiveAction;
    @Column(name="response_date") private LocalDate responseDate;
    @Column(name="response_sent") private Boolean responseSent=false;
    @Column(name="closed_date") private LocalDate closedDate;
    @Column(name="ncr_reference",length=30) private String ncrReference;
    @Column(name="created_at") private Instant createdAt=Instant.now();
    @Column(name="updated_at") private Instant updatedAt=Instant.now();
}