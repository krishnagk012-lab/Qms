package com.qmssuite.traceability.service;
import com.qmssuite.traceability.dto.TraceabilityDTO;import com.qmssuite.traceability.entity.TraceabilityEntity;
import com.qmssuite.traceability.repository.TraceabilityRepository;
import lombok.RequiredArgsConstructor;import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;import java.time.Instant;import java.util.List;
@Service @RequiredArgsConstructor
public class TraceabilityService {
    private final TraceabilityRepository repo;
    public List<TraceabilityDTO> findAll(){return repo.findAllOrdered().stream().map(this::toDTO).toList();}
    @Transactional
    public TraceabilityDTO save(TraceabilityDTO dto){
        TraceabilityEntity e=repo.findByChainId(dto.getChainId()).orElse(new TraceabilityEntity());
        e.setChainId(dto.getChainId());e.setParameter(dto.getParameter());e.setUnit(dto.getUnit());
        e.setMeasurementLevel(dto.getMeasurementLevel());
        e.setLink1Lab(dto.getLink1Lab());e.setLink1CertNo(dto.getLink1CertNo());e.setLink1Standard(dto.getLink1Standard());
        e.setLink2Lab(dto.getLink2Lab());e.setLink2CertNo(dto.getLink2CertNo());e.setLink2Standard(dto.getLink2Standard());
        e.setLink3Lab(dto.getLink3Lab());e.setLink3Standard(dto.getLink3Standard());e.setSiUnit(dto.getSiUnit());
        e.setValidUntil(dto.getValidUntil());e.setVerifiedBy(dto.getVerifiedBy());
        e.setLinkedEquipment(dto.getLinkedEquipment());e.setNotes(dto.getNotes());
        e.setUpdatedAt(Instant.now());repo.save(e);return toDTO(e);
    }
    private TraceabilityDTO toDTO(TraceabilityEntity e){return TraceabilityDTO.builder().id(e.getId()).chainId(e.getChainId()).parameter(e.getParameter()).unit(e.getUnit()).measurementLevel(e.getMeasurementLevel()).link1Lab(e.getLink1Lab()).link1CertNo(e.getLink1CertNo()).link1Standard(e.getLink1Standard()).link2Lab(e.getLink2Lab()).link2CertNo(e.getLink2CertNo()).link2Standard(e.getLink2Standard()).link3Lab(e.getLink3Lab()).link3Standard(e.getLink3Standard()).siUnit(e.getSiUnit()).validUntil(e.getValidUntil()).verifiedBy(e.getVerifiedBy()).linkedEquipment(e.getLinkedEquipment()).notes(e.getNotes()).createdAt(e.getCreatedAt()).updatedAt(e.getUpdatedAt()).build();}
}