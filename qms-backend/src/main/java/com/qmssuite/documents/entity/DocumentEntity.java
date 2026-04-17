package com.qmssuite.documents.entity;
import com.qmssuite.shared.BaseEntity;
import jakarta.persistence.*;import lombok.*;
import java.time.LocalDate;
@Entity @Table(name="documents") @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class DocumentEntity extends BaseEntity {
    @Column(name="doc_id",unique=true,nullable=false,length=30) private String docId;
    @Column(nullable=false,length=200) private String title;
    @Column(nullable=false,length=60) private String category;
    @Column(nullable=false,length=10) private String version;
    @Column(nullable=false,length=20) private String status;
    @Column(name="issue_date") private LocalDate issueDate;
    @Column(name="review_due") private LocalDate reviewDue;
    @Column(length=120) private String owner;
    @Column(columnDefinition="TEXT") private String description;
    @Column(name="file_path",length=500) private String filePath;
}