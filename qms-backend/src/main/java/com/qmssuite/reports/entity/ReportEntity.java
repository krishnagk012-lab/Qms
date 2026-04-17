package com.qmssuite.reports.entity;
import com.qmssuite.shared.BaseEntity;
import jakarta.persistence.*;import lombok.*;import java.time.LocalDate;
@Entity @Table(name="reports") @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ReportEntity extends BaseEntity {
    @Column(name="report_no",unique=true,nullable=false,length=30) private String reportNo;
    @Column(name="report_type",length=30) private String reportType;
    @Column(name="test_name",length=200) private String testName;
    @Column(name="sample_id",length=50) private String sampleId;
    @Column(length=150) private String client;
    @Column(name="issue_date") private LocalDate issueDate;
    @Column(length=120) private String analyst;
    @Column(name="authorised_by",length=120) private String authorisedBy;
    @Column(length=25) private String status;
    @Column(length=60) private String validity;
    @Column(name="pdf_path",length=500) private String pdfPath;
    @Column(name="uncertainty_stmt",columnDefinition="TEXT") private String uncertaintyStmt;
}