package com.qmssuite.shared;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;

@Entity @Table(name="audit_trail") @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AuditTrailEntity {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="event_time",nullable=false) private Instant eventTime;
    @Column(nullable=false,length=50) private String username;
    @Column(nullable=false,length=30) private String action;
    @Column(name="table_name",length=60) private String tableName;
    @Column(name="record_id",length=50) private String recordId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name="old_value",columnDefinition="jsonb")
    private String oldValue;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name="new_value",columnDefinition="jsonb")
    private String newValue;

    @Column(name="ip_address",length=45) private String ipAddress;
}