package com.qmssuite.samples.controller;
import com.qmssuite.samples.dto.SampleDTO;import com.qmssuite.samples.service.SampleService;
import com.qmssuite.shared.ApiResponse;import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;import org.springframework.web.bind.annotation.*;import java.util.List;
@RestController @RequestMapping("/api/samples") @RequiredArgsConstructor
public class SampleController {
    private final SampleService svc;
    @GetMapping public ResponseEntity<ApiResponse<List<SampleDTO>>> list(@RequestParam(required=false) String q,@RequestParam(required=false) String status){return ResponseEntity.ok(ApiResponse.ok(svc.search(q,status)));}
    @PostMapping public ResponseEntity<ApiResponse<SampleDTO>> save(@RequestBody SampleDTO dto){return ResponseEntity.ok(ApiResponse.ok("Saved",svc.save(dto)));}
    @GetMapping("/stats") public ResponseEntity<ApiResponse<?>> stats(){return ResponseEntity.ok(ApiResponse.ok(svc.stats()));}
}