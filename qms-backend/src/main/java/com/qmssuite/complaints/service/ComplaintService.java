package com.qmssuite.complaints.service;
import com.qmssuite.complaints.dto.ComplaintDTO;import com.qmssuite.complaints.entity.ComplaintEntity;
import com.qmssuite.complaints.repository.ComplaintRepository;
import lombok.RequiredArgsConstructor;import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;import java.time.Instant;import java.util.List;import java.util.Map;
@Service @RequiredArgsConstructor
public class ComplaintService {
    private final ComplaintRepository repo;
    public List<ComplaintDTO> search(String q,String status){return repo.search(q,status).stream().map(this::toDTO).toList();}
    @Transactional
    public ComplaintDTO save(ComplaintDTO dto){
        ComplaintEntity e=repo.findByComplaintId(dto.getComplaintId()).orElse(new ComplaintEntity());
        e.setComplaintId(dto.getComplaintId());e.setReceivedDate(dto.getReceivedDate());
        e.setComplainant(dto.getComplainant());e.setContact(dto.getContact());
        e.setComplaintType(dto.getComplaintType());e.setDescription(dto.getDescription());
        e.setRelatedReport(dto.getRelatedReport());e.setSeverity(dto.getSeverity());
        e.setStatus(dto.getStatus()!=null?dto.getStatus():"OPEN");e.setAssignedTo(dto.getAssignedTo());
        e.setInvestigation(dto.getInvestigation());e.setRootCause(dto.getRootCause());
        e.setCorrectiveAction(dto.getCorrectiveAction());e.setResponseDate(dto.getResponseDate());
        e.setResponseSent(dto.getResponseSent()!=null&&dto.getResponseSent());
        e.setClosedDate(dto.getClosedDate());e.setNcrReference(dto.getNcrReference());
        e.setUpdatedAt(Instant.now());repo.save(e);return toDTO(e);
    }
    public Map<String,Long> stats(){return Map.of("total",repo.count(),"open",repo.countByStatus("OPEN"),"resolved",repo.countByStatus("RESOLVED"),"closed",repo.countByStatus("CLOSED"));}
    private ComplaintDTO toDTO(ComplaintEntity e){return ComplaintDTO.builder().id(e.getId()).complaintId(e.getComplaintId()).receivedDate(e.getReceivedDate()).complainant(e.getComplainant()).contact(e.getContact()).complaintType(e.getComplaintType()).description(e.getDescription()).relatedReport(e.getRelatedReport()).severity(e.getSeverity()).status(e.getStatus()).assignedTo(e.getAssignedTo()).investigation(e.getInvestigation()).rootCause(e.getRootCause()).correctiveAction(e.getCorrectiveAction()).responseDate(e.getResponseDate()).responseSent(e.getResponseSent()).closedDate(e.getClosedDate()).ncrReference(e.getNcrReference()).createdAt(e.getCreatedAt()).updatedAt(e.getUpdatedAt()).build();}
}