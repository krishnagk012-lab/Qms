package com.qmssuite.equipment.controller;
import com.qmssuite.equipment.dto.EquipmentDTO;
import com.qmssuite.equipment.dto.EquipmentHistoryDTO;
import com.qmssuite.equipment.service.EquipmentService;
import com.qmssuite.equipment.service.EquipmentHistoryService;
import com.qmssuite.shared.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController @RequestMapping("/api/equipment") @RequiredArgsConstructor
public class EquipmentController {
    private final EquipmentService svc;
    private final EquipmentHistoryService historySvc;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<EquipmentDTO>>> list(
            @RequestParam(required=false) String q,
            @RequestParam(required=false) String status,
            @RequestParam(required=false) String location,
            @RequestParam(defaultValue="0") int page,
            @RequestParam(defaultValue="20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(svc.search(q, status, location, page, size)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EquipmentDTO>> save(
            @RequestBody EquipmentDTO dto, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("Saved", svc.save(dto, auth.getName())));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<?>> stats() {
        return ResponseEntity.ok(ApiResponse.ok(svc.stats()));
    }

    // ── History endpoints ────────────────────────────────────────────────

    @GetMapping("/{eqId}/history")
    public ResponseEntity<ApiResponse<List<EquipmentHistoryDTO>>> history(
            @PathVariable String eqId) {
        return ResponseEntity.ok(ApiResponse.ok(historySvc.getHistory(eqId)));
    }

    @GetMapping("/{eqId}/history/type/{type}")
    public ResponseEntity<ApiResponse<List<EquipmentHistoryDTO>>> historyByType(
            @PathVariable String eqId, @PathVariable String type) {
        return ResponseEntity.ok(ApiResponse.ok(historySvc.getHistoryByType(eqId, type.toUpperCase())));
    }

    @GetMapping("/{eqId}/history/range")
    public ResponseEntity<ApiResponse<List<EquipmentHistoryDTO>>> historyRange(
            @PathVariable String eqId,
            @RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.ok(historySvc.getHistoryByDateRange(eqId, from, to)));
    }

    @PostMapping("/{eqId}/history")
    public ResponseEntity<ApiResponse<EquipmentHistoryDTO>> addEvent(
            @PathVariable String eqId,
            @RequestBody EquipmentHistoryDTO dto,
            Authentication auth) {
        dto.setEqId(eqId);
        return ResponseEntity.ok(ApiResponse.ok("Event logged", historySvc.addEvent(dto, auth.getName())));
    }
}
