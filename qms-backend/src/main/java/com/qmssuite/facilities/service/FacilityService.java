package com.qmssuite.facilities.service;
import com.qmssuite.facilities.dto.*;
import com.qmssuite.facilities.entity.*;
import com.qmssuite.facilities.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service @RequiredArgsConstructor
public class FacilityService {
    private final FacilityRepository repo;
    private final EnvReadingRepository readingRepo;

    public List<FacilityDTO> search(String q, String status) {
        return repo.search(q, status).stream().map(this::toDTO).toList();
    }

    @Transactional
    public FacilityDTO save(FacilityDTO dto) {
        FacilityEntity e = repo.findByFacilityId(dto.getFacilityId()).orElse(new FacilityEntity());
        e.setFacilityId(dto.getFacilityId()); e.setName(dto.getName());
        e.setFacilityType(dto.getFacilityType()); e.setLocation(dto.getLocation());
        e.setAreaSqm(dto.getAreaSqm());
        e.setActivitiesPerformed(dto.getActivitiesPerformed());
        e.setDocumentedRequirements(dto.getDocumentedRequirements());
        e.setMonitorTemperature(b(dto.getMonitorTemperature()));
        e.setMonitorHumidity(b(dto.getMonitorHumidity()));
        e.setMonitorPressure(b(dto.getMonitorPressure()));
        e.setMonitorCo2(b(dto.getMonitorCo2()));
        e.setMonitorParticulates(b(dto.getMonitorParticulates()));
        e.setMonitorVibration(b(dto.getMonitorVibration()));
        e.setMonitorLighting(b(dto.getMonitorLighting()));
        e.setMonitorOther(dto.getMonitorOther());
        e.setTempMin(dto.getTempMin()); e.setTempMax(dto.getTempMax());
        e.setTempUnit(dto.getTempUnit() != null ? dto.getTempUnit() : "°C");
        e.setHumidityMin(dto.getHumidityMin()); e.setHumidityMax(dto.getHumidityMax());
        e.setAccessControl(dto.getAccessControl());
        e.setAccessRequirements(dto.getAccessRequirements());
        e.setContaminationControls(dto.getContaminationControls());
        e.setSeparationMeasures(dto.getSeparationMeasures());
        e.setIncompatibleAreas(dto.getIncompatibleAreas());
        e.setIsExternalSite(b(dto.getIsExternalSite()));
        e.setExternalSiteAddress(dto.getExternalSiteAddress());
        e.setExternalComplianceNotes(dto.getExternalComplianceNotes());
        e.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");
        e.setResponsiblePerson(dto.getResponsiblePerson());
        e.setNotes(dto.getNotes());
        e.setUpdatedAt(Instant.now());
        repo.save(e);
        return toDTO(e);
    }

    public List<EnvReadingDTO> getReadings(String facilityId) {
        return readingRepo.findByFacilityId(facilityId).stream().map(this::toReadingDTO).toList();
    }

    public List<EnvReadingDTO> getDeviations() {
        return readingRepo.findDeviations().stream().map(this::toReadingDTO).toList();
    }

    @Transactional
    public EnvReadingDTO logReading(EnvReadingDTO dto) {
        EnvReadingEntity e = EnvReadingEntity.builder()
            .facilityId(dto.getFacilityId())
            .recordedAt(dto.getRecordedAt() != null ? dto.getRecordedAt() : Instant.now())
            .recordedBy(dto.getRecordedBy())
            .temperature(dto.getTemperature()).humidity(dto.getHumidity())
            .pressure(dto.getPressure()).co2Ppm(dto.getCo2Ppm())
            .particulates(dto.getParticulates()).vibration(dto.getVibration())
            .lightingLux(dto.getLightingLux())
            .otherValue(dto.getOtherValue()).otherLabel(dto.getOtherLabel())
            .withinLimits(dto.getWithinLimits() != null ? dto.getWithinLimits() : true)
            .deviationNotes(dto.getDeviationNotes()).ncrReference(dto.getNcrReference())
            .build();
        return toReadingDTO(readingRepo.save(e));
    }

    public Map<String, Long> stats() {
        return Map.of(
            "total",      repo.count(),
            "active",     repo.countByStatus("ACTIVE"),
            "deviations", (long) readingRepo.findDeviations().size()
        );
    }

    private boolean b(Boolean v) { return v != null && v; }

    private FacilityDTO toDTO(FacilityEntity e) {
        return FacilityDTO.builder()
            .id(e.getId()).facilityId(e.getFacilityId()).name(e.getName())
            .facilityType(e.getFacilityType()).location(e.getLocation()).areaSqm(e.getAreaSqm())
            .activitiesPerformed(e.getActivitiesPerformed()).documentedRequirements(e.getDocumentedRequirements())
            .monitorTemperature(e.getMonitorTemperature()).monitorHumidity(e.getMonitorHumidity())
            .monitorPressure(e.getMonitorPressure()).monitorCo2(e.getMonitorCo2())
            .monitorParticulates(e.getMonitorParticulates()).monitorVibration(e.getMonitorVibration())
            .monitorLighting(e.getMonitorLighting()).monitorOther(e.getMonitorOther())
            .tempMin(e.getTempMin()).tempMax(e.getTempMax()).tempUnit(e.getTempUnit())
            .humidityMin(e.getHumidityMin()).humidityMax(e.getHumidityMax())
            .accessControl(e.getAccessControl()).accessRequirements(e.getAccessRequirements())
            .contaminationControls(e.getContaminationControls())
            .separationMeasures(e.getSeparationMeasures()).incompatibleAreas(e.getIncompatibleAreas())
            .isExternalSite(e.getIsExternalSite()).externalSiteAddress(e.getExternalSiteAddress())
            .externalComplianceNotes(e.getExternalComplianceNotes())
            .status(e.getStatus()).responsiblePerson(e.getResponsiblePerson()).notes(e.getNotes())
            .createdAt(e.getCreatedAt()).updatedAt(e.getUpdatedAt())
            .build();
    }

    private EnvReadingDTO toReadingDTO(EnvReadingEntity e) {
        return EnvReadingDTO.builder()
            .id(e.getId()).facilityId(e.getFacilityId())
            .recordedAt(e.getRecordedAt()).recordedBy(e.getRecordedBy())
            .temperature(e.getTemperature()).humidity(e.getHumidity()).pressure(e.getPressure())
            .co2Ppm(e.getCo2Ppm()).particulates(e.getParticulates()).vibration(e.getVibration())
            .lightingLux(e.getLightingLux()).otherValue(e.getOtherValue()).otherLabel(e.getOtherLabel())
            .withinLimits(e.getWithinLimits()).deviationNotes(e.getDeviationNotes())
            .ncrReference(e.getNcrReference())
            .build();
    }
}
