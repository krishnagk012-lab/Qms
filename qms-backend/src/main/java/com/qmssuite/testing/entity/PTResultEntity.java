package com.qmssuite.testing.entity;
import com.qmssuite.shared.BaseEntity;
import jakarta.persistence.*;import lombok.*;import java.math.BigDecimal;import java.time.LocalDate;
@Entity @Table(name="pt_results")
@AttributeOverride(name="updatedAt", column=@Column(name="updated_at", insertable=false, updatable=false))
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class PTResultEntity extends BaseEntity {
    @Column(name="result_id",unique=true,nullable=false,length=25) private String resultId;
    @Column(name="scheme_id") private java.util.UUID schemeId;
    @Column(name="round_no",length=20) private String roundNo;
    @Column(name="assigned_value",precision=15,scale=6) private BigDecimal assignedValue;
    @Column(name="lab_result",precision=15,scale=6) private BigDecimal labResult;
    @Column(precision=15,scale=6) private BigDecimal uncertainty;
    @Column(name="std_dev",precision=15,scale=8) private BigDecimal stdDev;
    @Column(name="z_score",precision=8,scale=4) private BigDecimal zScore;
    @Column(length=20) private String status;
    @Column(name="submission_date") private LocalDate submissionDate;
    @Column(length=120) private String analyst;
    @Column(columnDefinition="TEXT") private String notes;
}