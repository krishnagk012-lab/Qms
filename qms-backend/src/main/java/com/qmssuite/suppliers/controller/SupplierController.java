package com.qmssuite.suppliers.controller;
import com.qmssuite.suppliers.dto.SupplierDTO;import com.qmssuite.suppliers.service.SupplierService;
import com.qmssuite.shared.ApiResponse;import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;import org.springframework.web.bind.annotation.*;import java.util.List;
@RestController @RequestMapping("/api/suppliers") @RequiredArgsConstructor
public class SupplierController {
    private final SupplierService svc;
    @GetMapping public ResponseEntity<ApiResponse<List<SupplierDTO>>> list(@RequestParam(required=false) String q,@RequestParam(required=false) String type,@RequestParam(required=false) String status){return ResponseEntity.ok(ApiResponse.ok(svc.search(q,type,status)));}
    @PostMapping public ResponseEntity<ApiResponse<SupplierDTO>> save(@RequestBody SupplierDTO dto){return ResponseEntity.ok(ApiResponse.ok("Saved",svc.save(dto)));}
    @GetMapping("/stats") public ResponseEntity<ApiResponse<?>> stats(){return ResponseEntity.ok(ApiResponse.ok(svc.stats()));}
}