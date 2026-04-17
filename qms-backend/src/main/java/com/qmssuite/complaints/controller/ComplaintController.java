package com.qmssuite.complaints.controller;
import com.qmssuite.complaints.dto.ComplaintDTO;import com.qmssuite.complaints.service.ComplaintService;
import com.qmssuite.shared.ApiResponse;import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;import org.springframework.web.bind.annotation.*;import java.util.List;
@RestController @RequestMapping("/api/complaints") @RequiredArgsConstructor
public class ComplaintController {
    private final ComplaintService svc;
    @GetMapping public ResponseEntity<ApiResponse<List<ComplaintDTO>>> list(@RequestParam(required=false) String q,@RequestParam(required=false) String status){return ResponseEntity.ok(ApiResponse.ok(svc.search(q,status)));}
    @PostMapping public ResponseEntity<ApiResponse<ComplaintDTO>> save(@RequestBody ComplaintDTO dto){return ResponseEntity.ok(ApiResponse.ok("Saved",svc.save(dto)));}
    @GetMapping("/stats") public ResponseEntity<ApiResponse<?>> stats(){return ResponseEntity.ok(ApiResponse.ok(svc.stats()));}
}