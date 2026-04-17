package com.qmssuite.quality.entity;
import com.qmssuite.shared.BaseEntity;
import jakarta.persistence.*;import lombok.*;
@Entity @Table(name="risks") @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class RiskEntity extends BaseEntity {
    @Column(name="risk_id",unique=true,nullable=false,length=20) private String riskId;
    @Column(nullable=false,columnDefinition="TEXT") private String description;
    @Column(length=60) private String area;
    @Column(columnDefinition="smallint") private Integer likelihood;
    @Column(columnDefinition="smallint") private Integer impact;
    @Column(name="risk_score",columnDefinition="smallint",insertable=false,updatable=false) private Integer riskScore;
    @Column(length=10) private String level;
    @Column(length=20) private String treatment;
    @Column(length=20) private String status;
    @Column(name="control_measure",columnDefinition="TEXT") private String controlMeasure;
}