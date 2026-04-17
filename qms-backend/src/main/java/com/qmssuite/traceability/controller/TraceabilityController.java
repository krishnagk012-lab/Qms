package com.qmssuite.traceability.controller;
import com.qmssuite.traceability.dto.TraceabilityDTO;import com.qmssuite.traceability.service.TraceabilityService;
import com.qmssuite.shared.ApiResponse;import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;import org.springframework.web.bind.annotation.*;import java.util.List;
@RestController @RequestMapping("/api/traceability") @RequiredArgsConstructor
public class TraceabilityController {
    private final TraceabilityService svc;
    @GetMapping public ResponseEntity<ApiResponse<List<TraceabilityDTO>>> list(){return ResponseEntity.ok(ApiResponse.ok(svc.findAll()));}
    @PostMapping public ResponseEntity<ApiResponse<TraceabilityDTO>> save(@RequestBody TraceabilityDTO dto){return ResponseEntity.ok(ApiResponse.ok("Saved",svc.save(dto)));}
}