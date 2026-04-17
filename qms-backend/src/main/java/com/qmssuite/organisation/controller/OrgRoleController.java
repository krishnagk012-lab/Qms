package com.qmssuite.organisation.controller;
import com.qmssuite.organisation.dto.OrgRoleDTO;import com.qmssuite.organisation.service.OrgRoleService;
import com.qmssuite.shared.ApiResponse;import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;import org.springframework.web.bind.annotation.*;import java.util.List;
@RestController @RequestMapping("/api/organisation-roles") @RequiredArgsConstructor
public class OrgRoleController {
    private final OrgRoleService svc;
    @GetMapping public ResponseEntity<ApiResponse<List<OrgRoleDTO>>> list(){return ResponseEntity.ok(ApiResponse.ok(svc.findAll()));}
    @PostMapping public ResponseEntity<ApiResponse<OrgRoleDTO>> save(@RequestBody OrgRoleDTO dto){return ResponseEntity.ok(ApiResponse.ok("Saved",svc.save(dto)));}
}