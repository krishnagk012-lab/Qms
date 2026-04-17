package com.qmssuite.personnel.entity;
import com.qmssuite.shared.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity @Table(name="personnel") @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class PersonnelEntity extends BaseEntity {

    // ── Core identity ────────────────────────────────────────────────────────
    @Column(name="emp_id",unique=true,nullable=false,length=20) private String empId;
    @Column(name="full_name",nullable=false,length=120)         private String fullName;
    @Column(length=80)                                          private String designation;
    @Column(length=80)                                          private String department;
    @Column(nullable=false,length=20)                           private String status;
    @Column(length=120)                                         private String email;
    @Column(length=20)                                          private String phone;
    @Column(name="joined_date")                                 private LocalDate joinedDate;
    @Column(name="employee_type",length=20)                     private String employeeType;

    // ── Cl. 6.2.2 — Competence requirements ─────────────────────────────────
    @Column(length=150)                                              private String qualification;
    @Column(name="competence_requirements",columnDefinition="TEXT") private String competenceRequirements;
    @Column(name="technical_knowledge",columnDefinition="TEXT")     private String technicalKnowledge;
    @Column(columnDefinition="TEXT")                                private String skills;
    @Column(name="experience_years")                                private Integer experienceYears;

    // ── Cl. 6.2.3 — Competency assessment ───────────────────────────────────
    @Column(name="competency_assessed_date")            private LocalDate competencyAssessedDate;
    @Column(name="competency_assessed_by",length=120)   private String competencyAssessedBy;
    @Column(name="competency_status",length=30)         private String competencyStatus;

    // ── Cl. 6.2.4 — Duties, responsibilities, authorities ───────────────────
    @Column(name="job_description_ref",length=80)       private String jobDescriptionRef;
    @Column(columnDefinition="TEXT")                    private String responsibilities;
    @Column(name="reporting_to",length=120)             private String reportingTo;

    // ── Cl. 6.2.5(d) — Supervision ──────────────────────────────────────────
    @Column(name="supervised_by",length=120)            private String supervisedBy;
    @Column(name="supervision_level",length=30)         private String supervisionLevel;

    // ── Cl. 6.2.5(e) — Authorisation ────────────────────────────────────────
    @Column(name="authorised_activities",columnDefinition="TEXT") private String authorisedActivities;
    @Column(name="authorised_by",length=120)            private String authorisedBy;
    @Column(name="authorised_date")                     private LocalDate authorisedDate;
    @Column(name="authorisation_expiry")                private LocalDate authorisationExpiry;

    // ── Cl. 6.2.5(f) — Monitoring competence ────────────────────────────────
    @Column(name="last_competency_review")              private LocalDate lastCompetencyReview;
    @Column(name="next_competency_review")              private LocalDate nextCompetencyReview;
    @Column(name="competency_notes",columnDefinition="TEXT") private String competencyNotes;
}
