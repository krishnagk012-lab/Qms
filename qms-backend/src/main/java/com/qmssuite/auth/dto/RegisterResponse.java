package com.qmssuite.auth.dto;
import lombok.*;
import java.util.UUID;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class RegisterResponse {
    private UUID orgId;
    private String orgName;
    private String username;
    private String fullName;
    private String message;
}
