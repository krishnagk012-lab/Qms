package com.qmssuite.testing.entity;
import com.qmssuite.shared.BaseEntity;
import jakarta.persistence.*;import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;import org.hibernate.type.SqlTypes;
import java.time.LocalDate;import java.util.Map;
@Entity @Table(name="test_records") @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class TestRecordEntity extends BaseEntity {
    @Column(name="test_id",unique=true,nullable=false,length=20) private String testId;
    @Column(name="test_name",nullable=false,length=200) private String testName;
    @Column(name="sample_id",length=50) private String sampleId;
    @Column(length=150) private String client;
    @Column(name="start_date") private LocalDate startDate;
    @Column(name="end_date") private LocalDate endDate;
    @Column(length=120) private String analyst;
    @Column(length=25) private String result;
    @Column(length=25) private String stage;
    @Column(length=100) private String method;
    @JdbcTypeCode(SqlTypes.JSON) @Column(columnDefinition="jsonb") private Map<String,Object> parameters;
    @Column(columnDefinition="TEXT") private String notes;
}