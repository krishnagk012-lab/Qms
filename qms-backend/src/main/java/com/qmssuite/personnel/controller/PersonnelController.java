package com.qmssuite.personnel.controller;
import com.qmssuite.personnel.dto.*;import com.qmssuite.personnel.service.PersonnelService;
import com.qmssuite.shared.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/personnel") @RequiredArgsConstructor
@Tag(name="Personnel",description="Personnel & Competency – Clause 6.2")
public class PersonnelController {
    private final PersonnelService svc;
    @GetMapping public ResponseEntity<ApiResponse<?>> list(@RequestParam(required=false) String q,@RequestParam(required=false) String department,@RequestParam(required=false) String status,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="50") int size){return ResponseEntity.ok(ApiResponse.ok(svc.search(q,department,status,page,size)));}
    @PostMapping public ResponseEntity<ApiResponse<PersonnelDTO>> save(@RequestBody PersonnelDTO dto,Authentication auth){return ResponseEntity.ok(ApiResponse.ok("Saved",svc.save(dto,auth.getName())));}
    @GetMapping("/trainings") public ResponseEntity<ApiResponse<?>> trainings(){return ResponseEntity.ok(ApiResponse.ok(svc.getTrainings()));}
    @PostMapping("/trainings") public ResponseEntity<ApiResponse<TrainingDTO>> saveTraining(@RequestBody TrainingDTO dto,Authentication auth){return ResponseEntity.ok(ApiResponse.ok("Saved",svc.saveTraining(dto,auth.getName())));}
    @GetMapping("/stats") public ResponseEntity<ApiResponse<?>> stats(){return ResponseEntity.ok(ApiResponse.ok(svc.stats()));}
}