package com.qmssuite.management.entity;
import jakarta.persistence.*;import lombok.*;import java.time.Instant;import java.time.LocalDate;import java.util.UUID;
@Entity @Table(name="management_reviews") @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ManagementReviewEntity {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @Column(name="review_id",unique=true,nullable=false,length=20) private String reviewId;
    @Column(name="review_date",nullable=false) private LocalDate reviewDate;
    @Column(name="chaired_by",length=120) private String chairedBy;
    @Column(columnDefinition="TEXT") private String attendees;
    @Column(name="next_review_date") private LocalDate nextReviewDate;
    @Column(name="input_policy_objectives",columnDefinition="TEXT") private String inputPolicyObjectives;
    @Column(name="input_previous_actions",columnDefinition="TEXT") private String inputPreviousActions;
    @Column(name="input_recent_results",columnDefinition="TEXT") private String inputRecentResults;
    @Column(name="input_nonconformities",columnDefinition="TEXT") private String inputNonconformities;
    @Column(name="input_proficiency",columnDefinition="TEXT") private String inputProficiency;
    @Column(name="input_risk_actions",columnDefinition="TEXT") private String inputRiskActions;
    @Column(name="input_workload",columnDefinition="TEXT") private String inputWorkload;
    @Column(name="input_complaints",columnDefinition="TEXT") private String inputComplaints;
    @Column(name="input_resources",columnDefinition="TEXT") private String inputResources;
    @Column(name="input_supplier",columnDefinition="TEXT") private String inputSupplier;
    @Column(name="input_audit_findings",columnDefinition="TEXT") private String inputAuditFindings;
    @Column(name="input_external_changes",columnDefinition="TEXT") private String inputExternalChanges;
    @Column(name="output_qms_effectiveness",columnDefinition="TEXT") private String outputQmsEffectiveness;
    @Column(name="output_improvements",columnDefinition="TEXT") private String outputImprovements;
    @Column(name="output_resource_needs",columnDefinition="TEXT") private String outputResourceNeeds;
    @Column(name="output_action_items",columnDefinition="TEXT") private String outputActionItems;
    @Column(length=20) private String status="DRAFT";
    @Column(name="approved_by",length=120) private String approvedBy;
    @Column(name="approved_date") private LocalDate approvedDate;
    @Column(columnDefinition="TEXT") private String notes;
    @Column(name="created_at") private Instant createdAt=Instant.now();
}