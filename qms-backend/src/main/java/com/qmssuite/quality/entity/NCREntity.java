package com.qmssuite.quality.entity;
import com.qmssuite.shared.BaseEntity;
import jakarta.persistence.*;import lombok.*;import java.time.LocalDate;
@Entity @Table(name="ncrs") @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class NCREntity extends BaseEntity {
    @Column(name="ncr_id",unique=true,nullable=false,length=20) private String ncrId;
    @Column(nullable=false,columnDefinition="TEXT") private String finding;
    @Column(length=60) private String area;
    @Column(length=10) private String severity;
    @Column(length=20) private String status;
    @Column(name="raised_date") private LocalDate raisedDate;
    @Column(length=120) private String assignee;
    @Column(name="due_date") private LocalDate dueDate;
    @Column(name="root_cause",columnDefinition="TEXT") private String rootCause;
    @Column(name="corrective_action",columnDefinition="TEXT") private String correctiveAction;
    @Column(name="closed_date") private LocalDate closedDate;
}