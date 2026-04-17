package com.qmssuite.documents.service;
import com.qmssuite.documents.dto.*;import com.qmssuite.documents.entity.DocumentEntity;
import com.qmssuite.documents.repository.DocumentRepository;
import com.qmssuite.shared.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
@Service @RequiredArgsConstructor
public class DocumentService {
    private final DocumentRepository repo;
    private final AuditService audit;

    public Page<DocumentDTO> search(String q, String cat, String status, int page, int size, String sort){
        Pageable p=PageRequest.of(page,size);
        return repo.search(q,cat,status,p).map(this::toDTO);
    }

    @Transactional
    public DocumentDTO save(DocumentRequest req, String user){
        DocumentEntity e=repo.findByDocId(req.getDocId()).orElse(new DocumentEntity());
        e.setDocId(req.getDocId());e.setTitle(req.getTitle());e.setCategory(req.getCategory());
        e.setVersion(req.getVersion());e.setStatus(req.getStatus());
        e.setIssueDate(req.getIssueDate());e.setReviewDue(req.getReviewDue());
        e.setOwner(req.getOwner());e.setDescription(req.getDescription());
        repo.save(e);
        audit.log(user,"SAVE_DOCUMENT","documents",e.getDocId(),null);
        return toDTO(e);
    }

    public record DashStats(long total, long reviewDue, long active, long draft) {}
    public DashStats stats(){ return new DashStats(repo.count(),repo.countByReviewDueBefore(LocalDate.now()),repo.countByStatus("ACTIVE"),repo.countByStatus("DRAFT")); }

    private DocumentDTO toDTO(DocumentEntity e){
        return DocumentDTO.builder().id(e.getId()).docId(e.getDocId()).title(e.getTitle())
            .category(e.getCategory()).version(e.getVersion()).status(e.getStatus())
            .issueDate(e.getIssueDate()).reviewDue(e.getReviewDue()).owner(e.getOwner())
            .description(e.getDescription()).createdAt(e.getCreatedAt()).updatedAt(e.getUpdatedAt()).build();
    }
}