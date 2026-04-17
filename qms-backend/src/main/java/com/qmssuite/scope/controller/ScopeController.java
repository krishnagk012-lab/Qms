package com.qmssuite.scope.controller;
import com.qmssuite.scope.dto.ScopeDTO;import com.qmssuite.scope.service.ScopeService;
import com.qmssuite.shared.ApiResponse;import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;import org.springframework.web.bind.annotation.*;import java.util.List;
@RestController @RequestMapping("/api/scope") @RequiredArgsConstructor
public class ScopeController {
    private final ScopeService svc;
    @GetMapping public ResponseEntity<ApiResponse<List<ScopeDTO>>> list(){return ResponseEntity.ok(ApiResponse.ok(svc.findAll()));}
    @PostMapping public ResponseEntity<ApiResponse<ScopeDTO>> save(@RequestBody ScopeDTO dto){return ResponseEntity.ok(ApiResponse.ok("Saved",svc.save(dto)));}
}