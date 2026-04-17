package com.qmssuite.auth.controller;
import com.qmssuite.auth.dto.*;
import com.qmssuite.auth.service.AuthService;
import com.qmssuite.auth.service.RegisterService;
import com.qmssuite.shared.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor
@Tag(name="Authentication",description="Login and user management")
public class AuthController {
    private final AuthService svc;
    private final RegisterService registerSvc;

    /** Check if first-time setup has been completed */
    @GetMapping("/setup-status")
    @Operation(summary="Check if organisation has been registered")
    public ResponseEntity<ApiResponse<?>> setupStatus(){
        return ResponseEntity.ok(ApiResponse.ok(
            java.util.Map.of("setupDone", registerSvc.isSetupDone())
        ));
    }

    /** First-time organisation + admin registration */
    @PostMapping("/register")
    @Operation(summary="Register organisation and create first admin (one-time only)")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(
            @Valid @RequestBody RegisterRequest req){
        return ResponseEntity.ok(ApiResponse.ok("Registered", registerSvc.register(req)));
    }

    @PostMapping("/login") @Operation(summary="Login and get JWT token")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest req){
        return ResponseEntity.ok(ApiResponse.ok(svc.login(req)));
    }
    @PostMapping("/users") @Operation(summary="Create new user (Admin only)")
    public ResponseEntity<ApiResponse<UserDTO>> create(@Valid @RequestBody CreateUserRequest req){
        return ResponseEntity.ok(ApiResponse.ok("User created",svc.createUser(req)));
    }
    @GetMapping("/users") @Operation(summary="List all users")
    public ResponseEntity<ApiResponse<?>> list(){
        return ResponseEntity.ok(ApiResponse.ok(svc.getAll()));
    }
}