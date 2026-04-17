package com.qmssuite.methods.controller;
import com.qmssuite.methods.dto.MethodDTO;
import com.qmssuite.methods.service.MethodService;
import com.qmssuite.shared.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/methods") @RequiredArgsConstructor
public class MethodController {
    private final MethodService svc;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MethodDTO>>> list(
            @RequestParam(required=false) String q,
            @RequestParam(required=false) String type,
            @RequestParam(required=false) String status) {
        return ResponseEntity.ok(ApiResponse.ok(svc.search(q, type, status)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MethodDTO>> save(@RequestBody MethodDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok("Saved", svc.save(dto)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<?>> stats() {
        return ResponseEntity.ok(ApiResponse.ok(svc.stats()));
    }
}
