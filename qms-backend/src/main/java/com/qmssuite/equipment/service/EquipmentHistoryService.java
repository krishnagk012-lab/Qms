package com.qmssuite.equipment.service;

import com.qmssuite.equipment.dto.EquipmentHistoryDTO;
import com.qmssuite.equipment.entity.EquipmentHistoryEntity;
import com.qmssuite.equipment.repository.EquipmentHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipmentHistoryService {

    private final EquipmentHistoryRepository repo;

    public List<EquipmentHistoryDTO> getHistory(String eqId) {
        return repo.findAllByEqId(eqId).stream().map(this::toDTO).toList();
    }

    public List<EquipmentHistoryDTO> getCalibrationHistory(String eqId) {
        return repo.findCalibrationHistory(eqId).stream().map(this::toDTO).toList();
    }

    public List<EquipmentHistoryDTO> getHistoryByType(String eqId, String type) {
        return repo.findByEqIdAndType(eqId, type).stream().map(this::toDTO).toList();
    }

    public List<EquipmentHistoryDTO> getHistoryByDateRange(String eqId, LocalDate from, LocalDate to) {
        return repo.findByEqIdAndDateRange(eqId, from, to).stream().map(this::toDTO).toList();
    }

    @Transactional
    public EquipmentHistoryDTO addEvent(EquipmentHistoryDTO dto, String recordedBy) {
        EquipmentHistoryEntity e = EquipmentHistoryEntity.builder()
            .eqId(dto.getEqId())
            .eventType(dto.getEventType())
            .eventDate(dto.getEventDate() != null ? dto.getEventDate() : LocalDate.now())
            .performedBy(dto.getPerformedBy())
            .recordedBy(recordedBy)
            .recordedAt(Instant.now())
            .calCertNo(dto.getCalCertNo())
            .calAgency(dto.getCalAgency())
            .calResult(dto.getCalResult())
            .calDueDate(dto.getCalDueDate())
            .correctionFactor(dto.getCorrectionFactor())
            .traceability(dto.getTraceability())
            .workDone(dto.getWorkDone())
            .partsReplaced(dto.getPartsReplaced())
            .nextDueDate(dto.getNextDueDate())
            .description(dto.getDescription())
            .impact(dto.getImpact())
            .actionTaken(dto.getActionTaken())
            .ncrReference(dto.getNcrReference())
            .statusBefore(dto.getStatusBefore())
            .statusAfter(dto.getStatusAfter())
            .resultsAffected(dto.getResultsAffected() != null ? dto.getResultsAffected() : false)
            .reVerified(dto.getReVerified() != null ? dto.getReVerified() : false)
            .reVerifiedBy(dto.getReVerifiedBy())
            .reVerifiedDate(dto.getReVerifiedDate())
            .certFileRef(dto.getCertFileRef())
            .build();
        return toDTO(repo.save(e));
    }

    private EquipmentHistoryDTO toDTO(EquipmentHistoryEntity e) {
        return EquipmentHistoryDTO.builder()
            .id(e.getId()).eqId(e.getEqId())
            .eventType(e.getEventType()).eventDate(e.getEventDate())
            .performedBy(e.getPerformedBy()).recordedBy(e.getRecordedBy()).recordedAt(e.getRecordedAt())
            .calCertNo(e.getCalCertNo()).calAgency(e.getCalAgency()).calResult(e.getCalResult())
            .calDueDate(e.getCalDueDate()).correctionFactor(e.getCorrectionFactor()).traceability(e.getTraceability())
            .workDone(e.getWorkDone()).partsReplaced(e.getPartsReplaced()).nextDueDate(e.getNextDueDate())
            .description(e.getDescription()).impact(e.getImpact()).actionTaken(e.getActionTaken())
            .ncrReference(e.getNcrReference()).statusBefore(e.getStatusBefore()).statusAfter(e.getStatusAfter())
            .resultsAffected(e.getResultsAffected()).reVerified(e.getReVerified())
            .reVerifiedBy(e.getReVerifiedBy()).reVerifiedDate(e.getReVerifiedDate())
            .certFileRef(e.getCertFileRef())
            .build();
    }
}
