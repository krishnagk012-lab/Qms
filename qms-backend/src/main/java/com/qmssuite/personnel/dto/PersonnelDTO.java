package com.qmssuite.personnel.dto;
import lombok.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PersonnelDTO {
    private UUID id;
    // Core
    private String empId, fullName, designation, department, status, email, phone, employeeType;
    private LocalDate joinedDate;
    // Cl. 6.2.2 — Competence
    private String qualification, competenceRequirements, technicalKnowledge, skills;
    private Integer experienceYears;
    // Cl. 6.2.3 — Assessment
    private LocalDate competencyAssessedDate;
    private String competencyAssessedBy, competencyStatus;
    // Cl. 6.2.4 — Duties
    private String jobDescriptionRef, responsibilities, reportingTo;
    // Cl. 6.2.5(d) — Supervision
    private String supervisedBy, supervisionLevel;
    // Cl. 6.2.5(e) — Authorisation
    private String authorisedActivities, authorisedBy;
    private LocalDate authorisedDate, authorisationExpiry;
    // Cl. 6.2.5(f) — Monitoring
    private LocalDate lastCompetencyReview, nextCompetencyReview;
    private String competencyNotes;
    private Instant createdAt, updatedAt;
}
