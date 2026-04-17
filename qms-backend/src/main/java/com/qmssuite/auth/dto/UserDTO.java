package com.qmssuite.auth.dto;
import lombok.*;import java.time.Instant;import java.util.UUID;
@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class UserDTO {
    private UUID id;private String username;private String fullName;
    private String role;private String department;private String email;
    private boolean isActive;private Instant lastLogin;private Instant createdAt;
}