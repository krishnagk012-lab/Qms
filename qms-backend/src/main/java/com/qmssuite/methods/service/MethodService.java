package com.qmssuite.methods.service;
import com.qmssuite.methods.dto.MethodDTO;
import com.qmssuite.methods.entity.MethodEntity;
import com.qmssuite.methods.repository.MethodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service @RequiredArgsConstructor
public class MethodService {
    private final MethodRepository repo;

    public List<MethodDTO> search(String q, String type, String status) {
        return repo.search(q, type, status).stream().map(this::toDTO).toList();
    }

    @Transactional
    public MethodDTO save(MethodDTO dto) {
        MethodEntity e = repo.findByMethodId(dto.getMethodId()).orElse(new MethodEntity());
        e.setMethodId(dto.getMethodId()); e.setTitle(dto.getTitle());
        e.setMethodType(dto.getMethodType()); e.setStandardRef(dto.getStandardRef());
        e.setParameter(dto.getParameter()); e.setMatrix(dto.getMatrix());
        e.setScope(dto.getScope()); e.setAccreditationStatus(dto.getAccreditationStatus());
        e.setSelectionBasis(dto.getSelectionBasis()); e.setApplicableTo(dto.getApplicableTo());
        e.setValidationType(dto.getValidationType()); e.setValidationStatus(dto.getValidationStatus());
        e.setValidationDate(dto.getValidationDate()); e.setValidatedBy(dto.getValidatedBy());
        e.setValidationRef(dto.getValidationRef());
        e.setValLinearity(b(dto.getValLinearity())); e.setValPrecision(b(dto.getValPrecision()));
        e.setValAccuracy(b(dto.getValAccuracy())); e.setValSelectivity(b(dto.getValSelectivity()));
        e.setValLodLoq(b(dto.getValLodLoq())); e.setValRuggedness(b(dto.getValRuggedness()));
        e.setValUncertainty(b(dto.getValUncertainty()));
        e.setWorkingRange(dto.getWorkingRange()); e.setLod(dto.getLod()); e.setLoq(dto.getLoq());
        e.setPrecisionRsd(dto.getPrecisionRsd()); e.setBiasPercent(dto.getBiasPercent());
        e.setUncertaintyK2(dto.getUncertaintyK2());
        e.setRequiredEquipment(dto.getRequiredEquipment()); e.setRequiredReagents(dto.getRequiredReagents());
        e.setDeviationsApproved(dto.getDeviationsApproved());
        e.setSopReference(dto.getSopReference()); e.setResponsiblePerson(dto.getResponsiblePerson());
        e.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");
        e.setEffectiveDate(dto.getEffectiveDate()); e.setReviewDate(dto.getReviewDate());
        e.setNotes(dto.getNotes()); e.setUpdatedAt(Instant.now());
        repo.save(e);
        return toDTO(e);
    }

    public Map<String,Long> stats() {
        return Map.of(
            "total",      repo.count(),
            "active",     repo.countByStatus("ACTIVE"),
            "validated",  repo.countByValidationStatus("COMPLETED"),
            "accredited", repo.countByAccreditationStatus("ACCREDITED")
        );
    }

    private boolean b(Boolean v) { return v != null && v; }

    private MethodDTO toDTO(MethodEntity e) {
        return MethodDTO.builder()
            .id(e.getId()).methodId(e.getMethodId()).title(e.getTitle())
            .methodType(e.getMethodType()).standardRef(e.getStandardRef())
            .parameter(e.getParameter()).matrix(e.getMatrix()).scope(e.getScope())
            .accreditationStatus(e.getAccreditationStatus())
            .selectionBasis(e.getSelectionBasis()).applicableTo(e.getApplicableTo())
            .validationType(e.getValidationType()).validationStatus(e.getValidationStatus())
            .validationDate(e.getValidationDate()).validatedBy(e.getValidatedBy())
            .validationRef(e.getValidationRef())
            .valLinearity(e.getValLinearity()).valPrecision(e.getValPrecision())
            .valAccuracy(e.getValAccuracy()).valSelectivity(e.getValSelectivity())
            .valLodLoq(e.getValLodLoq()).valRuggedness(e.getValRuggedness())
            .valUncertainty(e.getValUncertainty())
            .workingRange(e.getWorkingRange()).lod(e.getLod()).loq(e.getLoq())
            .precisionRsd(e.getPrecisionRsd()).biasPercent(e.getBiasPercent())
            .uncertaintyK2(e.getUncertaintyK2())
            .requiredEquipment(e.getRequiredEquipment()).requiredReagents(e.getRequiredReagents())
            .deviationsApproved(e.getDeviationsApproved())
            .sopReference(e.getSopReference()).responsiblePerson(e.getResponsiblePerson())
            .status(e.getStatus()).effectiveDate(e.getEffectiveDate()).reviewDate(e.getReviewDate())
            .notes(e.getNotes()).createdAt(e.getCreatedAt()).updatedAt(e.getUpdatedAt())
            .build();
    }
}
