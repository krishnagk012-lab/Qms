package com.qmssuite.suppliers.service;
import com.qmssuite.suppliers.dto.SupplierDTO;import com.qmssuite.suppliers.entity.SupplierEntity;
import com.qmssuite.suppliers.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;import java.time.Instant;import java.util.List;import java.util.Map;
@Service @RequiredArgsConstructor
public class SupplierService {
    private final SupplierRepository repo;
    public List<SupplierDTO> search(String q,String type,String status){return repo.search(q,type,status).stream().map(this::toDTO).toList();}
    @Transactional
    public SupplierDTO save(SupplierDTO dto){
        SupplierEntity e=repo.findBySupplierId(dto.getSupplierId()).orElse(new SupplierEntity());
        e.setSupplierId(dto.getSupplierId());e.setName(dto.getName());e.setSupplierType(dto.getSupplierType());
        e.setContactPerson(dto.getContactPerson());e.setEmail(dto.getEmail());e.setPhone(dto.getPhone());
        e.setAddress(dto.getAddress());e.setAccreditationNo(dto.getAccreditationNo());
        e.setAccreditationBody(dto.getAccreditationBody());e.setAccreditationExpiry(dto.getAccreditationExpiry());
        e.setScopeOfSupply(dto.getScopeOfSupply());e.setEvaluationStatus(dto.getEvaluationStatus());
        e.setEvaluationDate(dto.getEvaluationDate());e.setEvaluatedBy(dto.getEvaluatedBy());
        e.setEvaluationCriteria(dto.getEvaluationCriteria());e.setReEvaluationDue(dto.getReEvaluationDue());
        e.setStatus(dto.getStatus()!=null?dto.getStatus():"ACTIVE");e.setNotes(dto.getNotes());
        e.setUpdatedAt(Instant.now());repo.save(e);return toDTO(e);
    }
    public Map<String,Long> stats(){return Map.of("total",repo.count(),"approved",repo.countByEvaluationStatus("APPROVED"),"pending",repo.countByEvaluationStatus("PENDING"));}
    private SupplierDTO toDTO(SupplierEntity e){return SupplierDTO.builder().id(e.getId()).supplierId(e.getSupplierId()).name(e.getName()).supplierType(e.getSupplierType()).contactPerson(e.getContactPerson()).email(e.getEmail()).phone(e.getPhone()).address(e.getAddress()).accreditationNo(e.getAccreditationNo()).accreditationBody(e.getAccreditationBody()).accreditationExpiry(e.getAccreditationExpiry()).scopeOfSupply(e.getScopeOfSupply()).evaluationStatus(e.getEvaluationStatus()).evaluationDate(e.getEvaluationDate()).evaluatedBy(e.getEvaluatedBy()).evaluationCriteria(e.getEvaluationCriteria()).reEvaluationDue(e.getReEvaluationDue()).status(e.getStatus()).notes(e.getNotes()).createdAt(e.getCreatedAt()).updatedAt(e.getUpdatedAt()).build();}
}