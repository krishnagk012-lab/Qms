package com.qmssuite.auth.dto;
import jakarta.validation.constraints.*;
import lombok.Data;
@Data public class LoginRequest {
    @NotBlank String username;
    @NotBlank String password;
}