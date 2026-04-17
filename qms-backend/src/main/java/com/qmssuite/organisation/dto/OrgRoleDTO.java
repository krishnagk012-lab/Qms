package com.qmssuite.organisation.dto;
import lombok.*;import java.time.Instant;import java.time.LocalDate;import java.util.UUID;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrgRoleDTO {
    private UUID id;private String roleId,roleTitle,isoRef,incumbent,empId;
    private String responsibilities,authorities,appointedBy,deputy;
    private LocalDate appointmentDate;private Instant createdAt;
}