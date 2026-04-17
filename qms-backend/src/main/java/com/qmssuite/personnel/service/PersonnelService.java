package com.qmssuite.personnel.service;
import com.qmssuite.personnel.dto.*;
import com.qmssuite.personnel.entity.*;
import com.qmssuite.personnel.repository.*;
import com.qmssuite.shared.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

@Service @RequiredArgsConstructor
public class PersonnelService {
    private final PersonnelRepository repo;
    private final TrainingRepository trainRepo;
    private final AuditService audit;

    public Page<PersonnelDTO> search(String q, String dept, String status, int page, int size) {
        return repo.search(q, dept, status, PageRequest.of(page, size)).map(this::toDTO);
    }

    @Transactional
    public PersonnelDTO save(PersonnelDTO dto, String user) {
        PersonnelEntity e = repo.findByEmpId(dto.getEmpId()).orElse(new PersonnelEntity());
        // Core
        e.setEmpId(dto.getEmpId()); e.setFullName(dto.getFullName());
        e.setDesignation(dto.getDesignation()); e.setDepartment(dto.getDepartment());
        e.setStatus(dto.getStatus()); e.setEmail(dto.getEmail()); e.setPhone(dto.getPhone());
        e.setJoinedDate(dto.getJoinedDate()); e.setEmployeeType(dto.getEmployeeType());
        // Cl. 6.2.2
        e.setQualification(dto.getQualification());
        e.setCompetenceRequirements(dto.getCompetenceRequirements());
        e.setTechnicalKnowledge(dto.getTechnicalKnowledge());
        e.setSkills(dto.getSkills()); e.setExperienceYears(dto.getExperienceYears());
        // Cl. 6.2.3
        e.setCompetencyAssessedDate(dto.getCompetencyAssessedDate());
        e.setCompetencyAssessedBy(dto.getCompetencyAssessedBy());
        e.setCompetencyStatus(dto.getCompetencyStatus());
        // Cl. 6.2.4
        e.setJobDescriptionRef(dto.getJobDescriptionRef());
        e.setResponsibilities(dto.getResponsibilities()); e.setReportingTo(dto.getReportingTo());
        // Cl. 6.2.5(d)
        e.setSupervisedBy(dto.getSupervisedBy()); e.setSupervisionLevel(dto.getSupervisionLevel());
        // Cl. 6.2.5(e)
        e.setAuthorisedActivities(dto.getAuthorisedActivities());
        e.setAuthorisedBy(dto.getAuthorisedBy()); e.setAuthorisedDate(dto.getAuthorisedDate());
        e.setAuthorisationExpiry(dto.getAuthorisationExpiry());
        // Cl. 6.2.5(f)
        e.setLastCompetencyReview(dto.getLastCompetencyReview());
        e.setNextCompetencyReview(dto.getNextCompetencyReview());
        e.setCompetencyNotes(dto.getCompetencyNotes());
        repo.save(e);
        audit.log(user, "SAVE", "personnel", e.getEmpId(), null);
        return toDTO(e);
    }

    public List<TrainingDTO> getTrainings() {
        return trainRepo.findAll().stream().map(this::toTrainingDTO).toList();
    }

    @Transactional
    public TrainingDTO saveTraining(TrainingDTO dto, String user) {
        TrainingEntity e = trainRepo.findAll().stream()
            .filter(t -> t.getTrainingId().equals(dto.getTrainingId())).findFirst()
            .orElse(new TrainingEntity());
        e.setTrainingId(dto.getTrainingId()); e.setTitle(dto.getTitle());
        e.setTrainingType(dto.getTrainingType()); e.setDateCompleted(dto.getDateCompleted());
        e.setNextDue(dto.getNextDue()); e.setApplicableTo(dto.getApplicableTo());
        e.setStatus(dto.getStatus()); e.setNotes(dto.getNotes());
        trainRepo.save(e);
        audit.log(user, "SAVE", "training_records", e.getTrainingId(), null);
        return toTrainingDTO(e);
    }

    public Map<String, Long> stats() {
        return Map.of(
            "total",           repo.count(),
            "active",          repo.countByStatus("ACTIVE"),
            "onLeave",         repo.countByStatus("ON_LEAVE"),
            "trainingOverdue", trainRepo.countByStatus("OVERDUE")
        );
    }

    private PersonnelDTO toDTO(PersonnelEntity e) {
        return PersonnelDTO.builder()
            .id(e.getId()).empId(e.getEmpId()).fullName(e.getFullName())
            .designation(e.getDesignation()).department(e.getDepartment())
            .status(e.getStatus()).email(e.getEmail()).phone(e.getPhone())
            .joinedDate(e.getJoinedDate()).employeeType(e.getEmployeeType())
            .qualification(e.getQualification())
            .competenceRequirements(e.getCompetenceRequirements())
            .technicalKnowledge(e.getTechnicalKnowledge())
            .skills(e.getSkills()).experienceYears(e.getExperienceYears())
            .competencyAssessedDate(e.getCompetencyAssessedDate())
            .competencyAssessedBy(e.getCompetencyAssessedBy())
            .competencyStatus(e.getCompetencyStatus())
            .jobDescriptionRef(e.getJobDescriptionRef())
            .responsibilities(e.getResponsibilities()).reportingTo(e.getReportingTo())
            .supervisedBy(e.getSupervisedBy()).supervisionLevel(e.getSupervisionLevel())
            .authorisedActivities(e.getAuthorisedActivities())
            .authorisedBy(e.getAuthorisedBy()).authorisedDate(e.getAuthorisedDate())
            .authorisationExpiry(e.getAuthorisationExpiry())
            .lastCompetencyReview(e.getLastCompetencyReview())
            .nextCompetencyReview(e.getNextCompetencyReview())
            .competencyNotes(e.getCompetencyNotes())
            .createdAt(e.getCreatedAt()).updatedAt(e.getUpdatedAt())
            .build();
    }

    private TrainingDTO toTrainingDTO(TrainingEntity e) {
        return TrainingDTO.builder().id(e.getId()).trainingId(e.getTrainingId())
            .title(e.getTitle()).trainingType(e.getTrainingType())
            .dateCompleted(e.getDateCompleted()).nextDue(e.getNextDue())
            .applicableTo(e.getApplicableTo()).status(e.getStatus()).notes(e.getNotes()).build();
    }
}
