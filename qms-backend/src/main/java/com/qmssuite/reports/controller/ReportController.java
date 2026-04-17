package com.qmssuite.reports.controller;
import com.qmssuite.reports.dto.ReportDTO;import com.qmssuite.reports.service.ReportService;
import com.qmssuite.shared.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/reports") @RequiredArgsConstructor
@Tag(name="Reports",description="Certificates & Reports – Clause 7.8")
public class ReportController {
    private final ReportService svc;
    @GetMapping public ResponseEntity<ApiResponse<?>> list(@RequestParam(required=false) String q,@RequestParam(required=false) String status,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){return ResponseEntity.ok(ApiResponse.ok(svc.search(q,status,page,size)));}
    @PostMapping public ResponseEntity<ApiResponse<ReportDTO>> save(@RequestBody ReportDTO dto,Authentication auth){return ResponseEntity.ok(ApiResponse.ok("Saved",svc.save(dto,auth.getName())));}
    @PatchMapping("/{reportNo}/approve") public ResponseEntity<ApiResponse<ReportDTO>> approve(@PathVariable String reportNo,Authentication auth){return ResponseEntity.ok(ApiResponse.ok("Approved",svc.approve(reportNo,auth.getName())));}
    @PatchMapping("/{reportNo}/reject")  public ResponseEntity<ApiResponse<ReportDTO>> reject (@PathVariable String reportNo,Authentication auth){return ResponseEntity.ok(ApiResponse.ok("Returned to Draft",svc.reject(reportNo,auth.getName())));}
    @GetMapping("/stats") public ResponseEntity<ApiResponse<?>> stats(){return ResponseEntity.ok(ApiResponse.ok(svc.stats()));}
}