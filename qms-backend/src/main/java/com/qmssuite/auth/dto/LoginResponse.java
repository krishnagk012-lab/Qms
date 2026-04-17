package com.qmssuite.auth.dto;
import lombok.*;
@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class LoginResponse {
    private String token;private String refreshToken;
    private String username;private String fullName;private String role;private String email;
}