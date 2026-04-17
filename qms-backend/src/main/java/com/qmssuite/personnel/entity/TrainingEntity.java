package com.qmssuite.personnel.entity;
import com.qmssuite.shared.BaseEntity;
import jakarta.persistence.*;import lombok.*;import java.time.LocalDate;
@Entity @Table(name="training_records")
@AttributeOverride(name="updatedAt", column=@Column(name="updated_at", insertable=false, updatable=false))
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class TrainingEntity extends BaseEntity {
    @Column(name="training_id",unique=true,nullable=false,length=20) private String trainingId;
    @Column(nullable=false,length=200) private String title;
    @Column(name="training_type",length=60) private String trainingType;
    @Column(name="date_completed") private LocalDate dateCompleted;
    @Column(name="next_due") private LocalDate nextDue;
    @Column(name="applicable_to",length=120) private String applicableTo;
    @Column(nullable=false,length=20) private String status;
    @Column(columnDefinition="TEXT") private String notes;
}