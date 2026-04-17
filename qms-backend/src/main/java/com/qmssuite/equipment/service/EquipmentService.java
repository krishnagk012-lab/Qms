package com.qmssuite.equipment.service;
import com.qmssuite.equipment.dto.EquipmentDTO;
import com.qmssuite.equipment.entity.EquipmentEntity;
import com.qmssuite.equipment.repository.EquipmentRepository;
import com.qmssuite.shared.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.Map;

@Service @RequiredArgsConstructor
public class EquipmentService {
    private final EquipmentRepository repo;
    private final AuditService audit;

    public Page<EquipmentDTO> search(String q, String status, String location, int page, int size) {
        return repo.search(q, status, location, PageRequest.of(page, size)).map(this::toDTO);
    }

    @Transactional
    public EquipmentDTO save(EquipmentDTO dto, String user) {
        EquipmentEntity e = repo.findByEqId(dto.getEqId()).orElse(new EquipmentEntity());
        // Identity
        e.setEqId(dto.getEqId()); e.setName(dto.getName());
        e.setFirmwareVersion(dto.getFirmwareVersion()); e.setAssetTag(dto.getAssetTag());
        // Manufacturer
        e.setMake(dto.getMake()); e.setModel(dto.getModel()); e.setSerialNo(dto.getSerialNo());
        // Verification
        e.setVerificationDate(dto.getVerificationDate()); e.setVerificationBy(dto.getVerificationBy());
        e.setAcceptanceCriteria(dto.getAcceptanceCriteria());
        // Measurement
        e.setMeasRange(dto.getMeasRange()); e.setResolution(dto.getResolution());
        // Location & status
        e.setLocation(dto.getLocation()); e.setStatus(dto.getStatus()); e.setCalLabelNo(dto.getCalLabelNo());
        // Calibration
        e.setLastCal(dto.getLastCal()); e.setNextCal(dto.getNextCal());
        e.setCalFrequency(dto.getCalFrequency()); e.setCalSource(dto.getCalSource());
        e.setCalCertNo(dto.getCalCertNo()); e.setCalResult(dto.getCalResult());
        e.setCorrectionFactor(dto.getCorrectionFactor()); e.setTraceabilityStmt(dto.getTraceabilityStmt());
        // Reference materials
        e.setRefMaterial(dto.getRefMaterial()); e.setRefValidityDate(dto.getRefValidityDate());
        // Maintenance
        e.setMaintenancePlan(dto.getMaintenancePlan());
        e.setLastMaintenance(dto.getLastMaintenance()); e.setNextMaintenance(dto.getNextMaintenance());
        // Damage
        e.setDamageHistory(dto.getDamageHistory());
        // Intermediate checks
        e.setIntermediateCheck(dto.getIntermediateCheck()); e.setCheckFrequency(dto.getCheckFrequency());
        // Personnel
        e.setAssignedTo(dto.getAssignedTo()); e.setSopReference(dto.getSopReference());
        // Purchase
        e.setPurchaseDate(dto.getPurchaseDate()); e.setCommissionedDate(dto.getCommissionedDate());
        e.setNotes(dto.getNotes());
        repo.save(e);
        audit.log(user, "SAVE", "equipment", e.getEqId(), null);
        return toDTO(e);
    }

    public Map<String,Long> stats() {
        return Map.of(
            "total",       repo.count(),
            "calibrated",  repo.countByStatus("CALIBRATED"),
            "dueSoon",     repo.countByNextCalBefore(LocalDate.now().plusDays(30)),
            "overdue",     repo.countByNextCalBefore(LocalDate.now())
        );
    }

    private EquipmentDTO toDTO(EquipmentEntity e) {
        return EquipmentDTO.builder()
            .id(e.getId()).eqId(e.getEqId()).name(e.getName())
            .firmwareVersion(e.getFirmwareVersion()).assetTag(e.getAssetTag())
            .make(e.getMake()).model(e.getModel()).serialNo(e.getSerialNo())
            .verificationDate(e.getVerificationDate()).verificationBy(e.getVerificationBy())
            .acceptanceCriteria(e.getAcceptanceCriteria())
            .measRange(e.getMeasRange()).resolution(e.getResolution())
            .location(e.getLocation()).status(e.getStatus()).calLabelNo(e.getCalLabelNo())
            .lastCal(e.getLastCal()).nextCal(e.getNextCal())
            .calFrequency(e.getCalFrequency()).calSource(e.getCalSource())
            .calCertNo(e.getCalCertNo()).calResult(e.getCalResult())
            .correctionFactor(e.getCorrectionFactor()).traceabilityStmt(e.getTraceabilityStmt())
            .refMaterial(e.getRefMaterial()).refValidityDate(e.getRefValidityDate())
            .maintenancePlan(e.getMaintenancePlan())
            .lastMaintenance(e.getLastMaintenance()).nextMaintenance(e.getNextMaintenance())
            .damageHistory(e.getDamageHistory())
            .intermediateCheck(e.getIntermediateCheck()).checkFrequency(e.getCheckFrequency())
            .assignedTo(e.getAssignedTo()).sopReference(e.getSopReference())
            .purchaseDate(e.getPurchaseDate()).commissionedDate(e.getCommissionedDate())
            .notes(e.getNotes())
            .createdAt(e.getCreatedAt()).updatedAt(e.getUpdatedAt())
            .build();
    }
}
