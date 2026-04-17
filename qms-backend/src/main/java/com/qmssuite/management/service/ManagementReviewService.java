package com.qmssuite.management.service;
import com.qmssuite.management.dto.ManagementReviewDTO;import com.qmssuite.management.entity.ManagementReviewEntity;
import com.qmssuite.management.repository.ManagementReviewRepository;
import lombok.RequiredArgsConstructor;import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;import java.time.Instant;import java.util.List;
@Service @RequiredArgsConstructor
public class ManagementReviewService {
    private final ManagementReviewRepository repo;
    public List<ManagementReviewDTO> findAll(){return repo.findAllOrdered().stream().map(this::toDTO).toList();}
    @Transactional
    public ManagementReviewDTO save(ManagementReviewDTO dto){
        ManagementReviewEntity e=repo.findByReviewId(dto.getReviewId()).orElse(new ManagementReviewEntity());
        e.setReviewId(dto.getReviewId());e.setReviewDate(dto.getReviewDate());e.setChairedBy(dto.getChairedBy());
        e.setAttendees(dto.getAttendees());e.setNextReviewDate(dto.getNextReviewDate());
        e.setInputPolicyObjectives(dto.getInputPolicyObjectives());e.setInputPreviousActions(dto.getInputPreviousActions());
        e.setInputRecentResults(dto.getInputRecentResults());e.setInputNonconformities(dto.getInputNonconformities());
        e.setInputProficiency(dto.getInputProficiency());e.setInputRiskActions(dto.getInputRiskActions());
        e.setInputWorkload(dto.getInputWorkload());e.setInputComplaints(dto.getInputComplaints());
        e.setInputResources(dto.getInputResources());e.setInputSupplier(dto.getInputSupplier());
        e.setInputAuditFindings(dto.getInputAuditFindings());e.setInputExternalChanges(dto.getInputExternalChanges());
        e.setOutputQmsEffectiveness(dto.getOutputQmsEffectiveness());e.setOutputImprovements(dto.getOutputImprovements());
        e.setOutputResourceNeeds(dto.getOutputResourceNeeds());e.setOutputActionItems(dto.getOutputActionItems());
        e.setStatus(dto.getStatus()!=null?dto.getStatus():"DRAFT");
        e.setApprovedBy(dto.getApprovedBy());e.setApprovedDate(dto.getApprovedDate());e.setNotes(dto.getNotes());
        repo.save(e);return toDTO(e);
    }
    private ManagementReviewDTO toDTO(ManagementReviewEntity e){return ManagementReviewDTO.builder().id(e.getId()).reviewId(e.getReviewId()).reviewDate(e.getReviewDate()).chairedBy(e.getChairedBy()).attendees(e.getAttendees()).nextReviewDate(e.getNextReviewDate()).inputPolicyObjectives(e.getInputPolicyObjectives()).inputPreviousActions(e.getInputPreviousActions()).inputRecentResults(e.getInputRecentResults()).inputNonconformities(e.getInputNonconformities()).inputProficiency(e.getInputProficiency()).inputRiskActions(e.getInputRiskActions()).inputWorkload(e.getInputWorkload()).inputComplaints(e.getInputComplaints()).inputResources(e.getInputResources()).inputSupplier(e.getInputSupplier()).inputAuditFindings(e.getInputAuditFindings()).inputExternalChanges(e.getInputExternalChanges()).outputQmsEffectiveness(e.getOutputQmsEffectiveness()).outputImprovements(e.getOutputImprovements()).outputResourceNeeds(e.getOutputResourceNeeds()).outputActionItems(e.getOutputActionItems()).status(e.getStatus()).approvedBy(e.getApprovedBy()).approvedDate(e.getApprovedDate()).notes(e.getNotes()).createdAt(e.getCreatedAt()).build();}
}