package com.qmssuite.scope.dto;
import lombok.*;import java.time.Instant;import java.time.LocalDate;import java.util.UUID;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ScopeDTO {
    private UUID id;private String scopeId,nablCertNo,parameter,methodRef,matrix;
    private String rangeFrom,rangeTo,unit,uncertainty,facility,status,linkedMethodId,notes;
    private LocalDate accreditedSince,validUntil;private Instant createdAt;
}