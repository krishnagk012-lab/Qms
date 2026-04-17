package com.qmssuite.reports.service;
import com.qmssuite.reports.dto.ReportDTO;import com.qmssuite.reports.entity.ReportEntity;
import com.qmssuite.reports.repository.ReportRepository;
import com.qmssuite.shared.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.File;import java.util.Map;
@Service @RequiredArgsConstructor
public class ReportService {
    private final ReportRepository repo; private final AuditService audit;
    @Value("${app.pdf.output-dir:./certificates}") private String pdfDir;

    public Page<ReportDTO> search(String q,String status,int page,int size){
        return repo.search(q,status,PageRequest.of(page,size)).map(this::toDTO);
    }
    @Transactional
    public ReportDTO save(ReportDTO dto,String user){
        ReportEntity e=repo.findByReportNo(dto.getReportNo()).orElse(new ReportEntity());
        e.setReportNo(dto.getReportNo());e.setReportType(dto.getReportType());e.setTestName(dto.getTestName());
        e.setSampleId(dto.getSampleId());e.setClient(dto.getClient());e.setIssueDate(dto.getIssueDate());
        e.setAnalyst(dto.getAnalyst());e.setAuthorisedBy(dto.getAuthorisedBy());e.setStatus(dto.getStatus());
        e.setValidity(dto.getValidity());e.setUncertaintyStmt(dto.getUncertaintyStmt());
        repo.save(e); audit.log(user,"SAVE","reports",e.getReportNo(),null); return toDTO(e);
    }
    @Transactional
    public ReportDTO approve(String reportNo, String user) {
        ReportEntity e = repo.findByReportNo(reportNo)
            .orElseThrow(() -> new IllegalArgumentException("Report not found: " + reportNo));
        if (!"PENDING_APPROVAL".equals(e.getStatus()))
            throw new IllegalArgumentException("Only PENDING_APPROVAL reports can be approved");
        e.setStatus("ISSUED");
        repo.save(e);
        audit.log(user, "APPROVE", "reports", reportNo, "{\"status\":\"ISSUED\"}");
        return toDTO(e);
    }

    @Transactional
    public ReportDTO reject(String reportNo, String user) {
        ReportEntity e = repo.findByReportNo(reportNo)
            .orElseThrow(() -> new IllegalArgumentException("Report not found: " + reportNo));
        e.setStatus("DRAFT");
        repo.save(e);
        audit.log(user, "REJECT", "reports", reportNo, "{\"status\":\"DRAFT\"}");
        return toDTO(e);
    }

    public Map<String,Long> stats(){return Map.of("issued",repo.countByStatus("ISSUED"),"draft",repo.countByStatus("DRAFT"),"pending",repo.countByStatus("PENDING_APPROVAL"));}
    private ReportDTO toDTO(ReportEntity e){
        boolean hasPdf=e.getPdfPath()!=null&&new File(e.getPdfPath()).exists();
        return ReportDTO.builder().id(e.getId()).reportNo(e.getReportNo()).reportType(e.getReportType()).testName(e.getTestName()).sampleId(e.getSampleId()).client(e.getClient()).issueDate(e.getIssueDate()).analyst(e.getAnalyst()).authorisedBy(e.getAuthorisedBy()).status(e.getStatus()).validity(e.getValidity()).pdfPath(e.getPdfPath()).uncertaintyStmt(e.getUncertaintyStmt()).createdAt(e.getCreatedAt()).updatedAt(e.getUpdatedAt()).hasPdf(hasPdf).build();
    }
}