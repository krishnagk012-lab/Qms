package com.qmssuite.organisation.service;
import com.qmssuite.organisation.dto.OrgRoleDTO;import com.qmssuite.organisation.entity.OrgRoleEntity;
import com.qmssuite.organisation.repository.OrgRoleRepository;
import lombok.RequiredArgsConstructor;import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;import java.util.List;
@Service @RequiredArgsConstructor
public class OrgRoleService {
    private final OrgRoleRepository repo;
    public List<OrgRoleDTO> findAll(){return repo.findAllOrdered().stream().map(this::toDTO).toList();}
    @Transactional
    public OrgRoleDTO save(OrgRoleDTO dto){
        OrgRoleEntity e=repo.findByRoleId(dto.getRoleId()).orElse(new OrgRoleEntity());
        e.setRoleId(dto.getRoleId());e.setRoleTitle(dto.getRoleTitle());e.setIsoRef(dto.getIsoRef());
        e.setIncumbent(dto.getIncumbent());e.setEmpId(dto.getEmpId());
        e.setResponsibilities(dto.getResponsibilities());e.setAuthorities(dto.getAuthorities());
        e.setAppointedBy(dto.getAppointedBy());e.setAppointmentDate(dto.getAppointmentDate());
        e.setDeputy(dto.getDeputy());repo.save(e);return toDTO(e);
    }
    private OrgRoleDTO toDTO(OrgRoleEntity e){return OrgRoleDTO.builder().id(e.getId()).roleId(e.getRoleId()).roleTitle(e.getRoleTitle()).isoRef(e.getIsoRef()).incumbent(e.getIncumbent()).empId(e.getEmpId()).responsibilities(e.getResponsibilities()).authorities(e.getAuthorities()).appointedBy(e.getAppointedBy()).appointmentDate(e.getAppointmentDate()).deputy(e.getDeputy()).createdAt(e.getCreatedAt()).build();}
}