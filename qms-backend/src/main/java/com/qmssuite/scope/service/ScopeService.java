package com.qmssuite.scope.service;
import com.qmssuite.scope.dto.ScopeDTO;import com.qmssuite.scope.entity.ScopeEntity;
import com.qmssuite.scope.repository.ScopeRepository;
import lombok.RequiredArgsConstructor;import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;import java.util.List;
@Service @RequiredArgsConstructor
public class ScopeService {
    private final ScopeRepository repo;
    public List<ScopeDTO> findAll(){return repo.findAllOrdered().stream().map(this::toDTO).toList();}
    @Transactional
    public ScopeDTO save(ScopeDTO dto){
        ScopeEntity e=repo.findByScopeId(dto.getScopeId()).orElse(new ScopeEntity());
        e.setScopeId(dto.getScopeId());e.setNablCertNo(dto.getNablCertNo());e.setParameter(dto.getParameter());
        e.setMethodRef(dto.getMethodRef());e.setMatrix(dto.getMatrix());e.setRangeFrom(dto.getRangeFrom());
        e.setRangeTo(dto.getRangeTo());e.setUnit(dto.getUnit());e.setUncertainty(dto.getUncertainty());
        e.setFacility(dto.getFacility());e.setAccreditedSince(dto.getAccreditedSince());
        e.setValidUntil(dto.getValidUntil());e.setStatus(dto.getStatus()!=null?dto.getStatus():"ACTIVE");
        e.setLinkedMethodId(dto.getLinkedMethodId());e.setNotes(dto.getNotes());
        repo.save(e);return toDTO(e);
    }
    private ScopeDTO toDTO(ScopeEntity e){return ScopeDTO.builder().id(e.getId()).scopeId(e.getScopeId()).nablCertNo(e.getNablCertNo()).parameter(e.getParameter()).methodRef(e.getMethodRef()).matrix(e.getMatrix()).rangeFrom(e.getRangeFrom()).rangeTo(e.getRangeTo()).unit(e.getUnit()).uncertainty(e.getUncertainty()).facility(e.getFacility()).accreditedSince(e.getAccreditedSince()).validUntil(e.getValidUntil()).status(e.getStatus()).linkedMethodId(e.getLinkedMethodId()).notes(e.getNotes()).createdAt(e.getCreatedAt()).build();}
}