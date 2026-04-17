package com.qmssuite.quality.controller;
import com.qmssuite.quality.dto.*;import com.qmssuite.quality.service.QualityService;
import com.qmssuite.shared.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/quality") @RequiredArgsConstructor
@Tag(name="Quality",description="NCR / Audit / CAPA / Risk – Clauses 8.5–8.8")
public class QualityController {
    private final QualityService svc;
    @GetMapping("/ncrs") public ResponseEntity<ApiResponse<?>> ncrs(@RequestParam(required=false) String q,@RequestParam(required=false) String status,@RequestParam(required=false) String area,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){return ResponseEntity.ok(ApiResponse.ok(svc.searchNCRs(q,status,area,page,size)));}
    @PostMapping("/ncrs") public ResponseEntity<ApiResponse<NCRDTO>> saveNCR(@RequestBody NCRDTO dto,Authentication auth){return ResponseEntity.ok(ApiResponse.ok("Saved",svc.saveNCR(dto,auth.getName())));}
    @GetMapping("/risks") public ResponseEntity<ApiResponse<?>> risks(){return ResponseEntity.ok(ApiResponse.ok(svc.getRisks()));}
    @PostMapping("/risks") public ResponseEntity<ApiResponse<RiskDTO>> saveRisk(@RequestBody RiskDTO dto,Authentication auth){return ResponseEntity.ok(ApiResponse.ok("Saved",svc.saveRisk(dto,auth.getName())));}
    @GetMapping("/stats") public ResponseEntity<ApiResponse<?>> stats(){return ResponseEntity.ok(ApiResponse.ok(svc.stats()));}
}