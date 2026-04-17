package com.qmssuite.testing.controller;
import com.qmssuite.testing.dto.*;import com.qmssuite.testing.service.TestingService;
import com.qmssuite.shared.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;import java.util.UUID;
@RestController @RequestMapping("/api/testing") @RequiredArgsConstructor
@Tag(name="Testing",description="Test Records & Proficiency Testing – Clauses 7.5–7.7")
public class TestingController {
    private final TestingService svc;
    @GetMapping public ResponseEntity<ApiResponse<?>> list(@RequestParam(required=false) String q,@RequestParam(required=false) String result,@RequestParam(required=false) String stage,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){return ResponseEntity.ok(ApiResponse.ok(svc.searchTests(q,result,stage,page,size)));}
    @PostMapping public ResponseEntity<ApiResponse<TestRecordDTO>> save(@RequestBody TestRecordDTO dto,Authentication auth){return ResponseEntity.ok(ApiResponse.ok("Saved",svc.saveTest(dto,auth.getName())));}
    @GetMapping("/pt") public ResponseEntity<ApiResponse<?>> ptList(@RequestParam(required=false) UUID schemeId){return ResponseEntity.ok(ApiResponse.ok(svc.getPTResults(schemeId)));}
    @PostMapping("/pt") public ResponseEntity<ApiResponse<PTResultDTO>> savePT(@RequestBody PTResultDTO dto,Authentication auth){return ResponseEntity.ok(ApiResponse.ok("Saved",svc.savePT(dto,auth.getName())));}
    @GetMapping("/stats") public ResponseEntity<ApiResponse<?>> stats(){return ResponseEntity.ok(ApiResponse.ok(svc.stats()));}
}