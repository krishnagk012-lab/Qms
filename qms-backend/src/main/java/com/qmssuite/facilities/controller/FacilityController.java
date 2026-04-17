package com.qmssuite.facilities.controller;
import com.qmssuite.facilities.dto.*;
import com.qmssuite.facilities.service.FacilityService;
import com.qmssuite.shared.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/facilities") @RequiredArgsConstructor
public class FacilityController {
    private final FacilityService svc;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FacilityDTO>>> list(
            @RequestParam(required=false) String q,
            @RequestParam(required=false) String status) {
        return ResponseEntity.ok(ApiResponse.ok(svc.search(q, status)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FacilityDTO>> save(@RequestBody FacilityDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok("Saved", svc.save(dto)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<?>> stats() {
        return ResponseEntity.ok(ApiResponse.ok(svc.stats()));
    }

    @GetMapping("/{facilityId}/readings")
    public ResponseEntity<ApiResponse<List<EnvReadingDTO>>> readings(@PathVariable String facilityId) {
        return ResponseEntity.ok(ApiResponse.ok(svc.getReadings(facilityId)));
    }

    @PostMapping("/{facilityId}/readings")
    public ResponseEntity<ApiResponse<EnvReadingDTO>> logReading(
            @PathVariable String facilityId, @RequestBody EnvReadingDTO dto) {
        dto.setFacilityId(facilityId);
        return ResponseEntity.ok(ApiResponse.ok("Logged", svc.logReading(dto)));
    }

    @GetMapping("/deviations")
    public ResponseEntity<ApiResponse<List<EnvReadingDTO>>> deviations() {
        return ResponseEntity.ok(ApiResponse.ok(svc.getDeviations()));
    }
}
