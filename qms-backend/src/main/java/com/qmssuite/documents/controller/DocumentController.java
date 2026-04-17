package com.qmssuite.documents.controller;
import com.qmssuite.documents.dto.*;import com.qmssuite.documents.service.DocumentService;
import com.qmssuite.shared.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/documents") @RequiredArgsConstructor
@Tag(name="Documents",description="Document control – ISO 17025 Clause 8.3")
public class DocumentController {
    private final DocumentService svc;
    @GetMapping @Operation(summary="Search/list documents")
    public ResponseEntity<ApiResponse<Page<DocumentDTO>>> list(
            @RequestParam(required=false) String q,
            @RequestParam(required=false) String category,
            @RequestParam(required=false) String status,
            @RequestParam(defaultValue="0") int page,
            @RequestParam(defaultValue="20") int size){
        return ResponseEntity.ok(ApiResponse.ok(svc.search(q,category,status,page,size,"updatedAt")));
    }
    @PostMapping @Operation(summary="Create or update document")
    public ResponseEntity<ApiResponse<DocumentDTO>> save(@Valid @RequestBody DocumentRequest req, Authentication auth){
        return ResponseEntity.ok(ApiResponse.ok("Saved",svc.save(req,auth.getName())));
    }
    @GetMapping("/stats") @Operation(summary="Dashboard stats")
    public ResponseEntity<ApiResponse<?>> stats(){ return ResponseEntity.ok(ApiResponse.ok(svc.stats())); }
}