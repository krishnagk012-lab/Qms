package com.qmssuite.auth.dto;
import jakarta.validation.constraints.*;import lombok.Data;
@Data public class CreateUserRequest {
    @NotBlank @Size(min=3,max=50) private String username;
    @NotBlank private String fullName;
    @NotBlank @Pattern(regexp="ADMIN|MANAGER|ANALYST|AUDITOR|VIEWER") private String role;
    private String department;
    @Email private String email;
    @NotBlank @Size(min=6) private String password;
}