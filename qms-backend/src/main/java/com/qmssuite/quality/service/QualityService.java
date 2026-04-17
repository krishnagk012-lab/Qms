package com.qmssuite.quality.service;
import com.qmssuite.quality.dto.*;import com.qmssuite.quality.entity.*;
import com.qmssuite.quality.repository.*;
import com.qmssuite.shared.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;import java.util.Map;
@Service @RequiredArgsConstructor
public class QualityService {
    private final NCRRepository ncrRepo; private final RiskRepository riskRepo; private final AuditService audit;

    public Page<NCRDTO> searchNCRs(String q,String status,String area,int page,int size){
        return ncrRepo.search(q,status,area,PageRequest.of(page,size)).map(this::toNCRDTO);
    }
    @Transactional
    public NCRDTO saveNCR(NCRDTO dto,String user){
        NCREntity e=dto.getNcrId()!=null?ncrRepo.findByNcrId(dto.getNcrId()).orElse(new NCREntity()):new NCREntity();
        e.setNcrId(dto.getNcrId());e.setFinding(dto.getFinding());e.setArea(dto.getArea());
        e.setSeverity(dto.getSeverity());e.setStatus(dto.getStatus());e.setRaisedDate(dto.getRaisedDate());
        e.setAssignee(dto.getAssignee());e.setDueDate(dto.getDueDate());e.setRootCause(dto.getRootCause());
        e.setCorrectiveAction(dto.getCorrectiveAction());e.setClosedDate(dto.getClosedDate());
        ncrRepo.save(e); audit.log(user,"SAVE","ncrs",e.getNcrId(),null); return toNCRDTO(e);
    }
    public java.util.List<RiskDTO> getRisks(){return riskRepo.findAll(Sort.by(Sort.Direction.DESC,"likelihood")).stream().map(this::toRiskDTO).toList();}
    @Transactional
    public RiskDTO saveRisk(RiskDTO dto,String user){
        RiskEntity e=dto.getRiskId()!=null?riskRepo.findByRiskId(dto.getRiskId()).orElse(new RiskEntity()):new RiskEntity();
        e.setRiskId(dto.getRiskId());e.setDescription(dto.getDescription());e.setArea(dto.getArea());
        e.setLikelihood(dto.getLikelihood());e.setImpact(dto.getImpact());
        int score=(dto.getLikelihood()!=null?dto.getLikelihood():3)*(dto.getImpact()!=null?dto.getImpact():3);
        e.setLevel(score>=12?"HIGH":score>=6?"MEDIUM":"LOW");
        e.setTreatment(dto.getTreatment());e.setStatus(dto.getStatus());e.setControlMeasure(dto.getControlMeasure());
        riskRepo.save(e); audit.log(user,"SAVE","risks",e.getRiskId(),null); return toRiskDTO(e);
    }
    public Map<String,Long> stats(){return Map.of("open",ncrRepo.countByStatus("OPEN"),"inProgress",ncrRepo.countByStatus("IN_PROGRESS"),"closed",ncrRepo.countByStatus("CLOSED"),"highRisk",riskRepo.countByLevel("HIGH"),"mediumRisk",riskRepo.countByLevel("MEDIUM"));}
    private NCRDTO toNCRDTO(NCREntity e){return NCRDTO.builder().id(e.getId()).ncrId(e.getNcrId()).finding(e.getFinding()).area(e.getArea()).severity(e.getSeverity()).status(e.getStatus()).raisedDate(e.getRaisedDate()).assignee(e.getAssignee()).dueDate(e.getDueDate()).rootCause(e.getRootCause()).correctiveAction(e.getCorrectiveAction()).closedDate(e.getClosedDate()).createdAt(e.getCreatedAt()).updatedAt(e.getUpdatedAt()).build();}
    private RiskDTO toRiskDTO(RiskEntity e){return RiskDTO.builder().id(e.getId()).riskId(e.getRiskId()).description(e.getDescription()).area(e.getArea()).likelihood(e.getLikelihood()).impact(e.getImpact()).riskScore(e.getRiskScore()).level(e.getLevel()).treatment(e.getTreatment()).status(e.getStatus()).controlMeasure(e.getControlMeasure()).createdAt(e.getCreatedAt()).updatedAt(e.getUpdatedAt()).build();}
}