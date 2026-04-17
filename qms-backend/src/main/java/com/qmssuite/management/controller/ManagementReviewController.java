package com.qmssuite.management.controller;
import com.qmssuite.management.dto.ManagementReviewDTO;import com.qmssuite.management.service.ManagementReviewService;
import com.qmssuite.shared.ApiResponse;import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;import org.springframework.web.bind.annotation.*;import java.util.List;
@RestController @RequestMapping("/api/management-reviews") @RequiredArgsConstructor
public class ManagementReviewController {
    private final ManagementReviewService svc;
    @GetMapping public ResponseEntity<ApiResponse<List<ManagementReviewDTO>>> list(){return ResponseEntity.ok(ApiResponse.ok(svc.findAll()));}
    @PostMapping public ResponseEntity<ApiResponse<ManagementReviewDTO>> save(@RequestBody ManagementReviewDTO dto){return ResponseEntity.ok(ApiResponse.ok("Saved",svc.save(dto)));}
}