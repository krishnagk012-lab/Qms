package com.qmssuite.shared.pdf;

import com.qmssuite.documents.repository.DocumentRepository;
import com.qmssuite.equipment.repository.EquipmentRepository;
import com.qmssuite.quality.repository.NCRRepository;
import com.qmssuite.reports.repository.ReportRepository;
import com.qmssuite.personnel.repository.PersonnelRepository;
import com.qmssuite.equipment.repository.EquipmentHistoryRepository;
import com.qmssuite.equipment.entity.EquipmentHistoryEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/print")
@RequiredArgsConstructor
public class PrintController {

    private final PdfService pdf;
    private final ReportRepository reportRepo;
    private final EquipmentRepository equipRepo;
    private final NCRRepository ncrRepo;
    private final DocumentRepository docRepo;
    private final PersonnelRepository personnelRepo;
    private final EquipmentHistoryRepository equipHistoryRepo;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");

    private ResponseEntity<byte[]> pdfResponse(byte[] bytes, String filename) {
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
            .contentType(MediaType.APPLICATION_PDF)
            .contentLength(bytes.length)
            .body(bytes);
    }

    // ── Test Certificate ───────────────────────────────────────────────────
    @GetMapping("/certificate/{reportNo}")
    public ResponseEntity<byte[]> certificate(@PathVariable String reportNo) {
        var e = reportRepo.findByReportNo(reportNo)
            .orElseThrow(() -> new IllegalArgumentException("Report not found: " + reportNo));

        Map<String, Map<String, String>> sections = new LinkedHashMap<>();

        Map<String, String> details = new LinkedHashMap<>();
        details.put("Report No",     e.getReportNo());
        details.put("Report Type",   e.getReportType());
        details.put("Status",        e.getStatus());
        details.put("Issue Date",    e.getIssueDate() != null ? e.getIssueDate().format(FMT) : "—");
        details.put("Validity",      nvl(e.getValidity()));
        sections.put("Certificate Details", details);

        Map<String, String> sample = new LinkedHashMap<>();
        sample.put("Test / Analysis", nvl(e.getTestName()));
        sample.put("Sample ID",       nvl(e.getSampleId()));
        sample.put("Client",          nvl(e.getClient()));
        sections.put("Sample Information", sample);

        Map<String, String> persons = new LinkedHashMap<>();
        persons.put("Analyst",        nvl(e.getAnalyst()));
        persons.put("Authorised By",  nvl(e.getAuthorisedBy()));
        sections.put("Personnel", persons);

        if (e.getUncertaintyStmt() != null && !e.getUncertaintyStmt().isBlank()) {
            Map<String, String> unc = new LinkedHashMap<>();
            unc.put("Statement", e.getUncertaintyStmt());
            sections.put("Measurement Uncertainty", unc);
        }

        byte[] bytes = pdf.generateDocument(
            "Test Certificate", e.getReportNo(), null, sections,
            "This certificate shall not be reproduced except in full without written approval of the laboratory. " +
            "Results relate only to the items tested. ISO/IEC 17025 : 2017 Accredited Laboratory."
        );
        return pdfResponse(bytes, "Certificate-" + reportNo + ".pdf");
    }

    // ── Equipment Full History Report — ISO 17025 Cl. 6.4.13 ──────────────
    @GetMapping("/equipment/{eqId}")
    public ResponseEntity<byte[]> equipment(@PathVariable String eqId,
            @RequestParam(defaultValue="false") boolean historyOnly) {
        var e = equipRepo.findByEqId(eqId)
            .orElseThrow(() -> new IllegalArgumentException("Equipment not found: " + eqId));
        List<EquipmentHistoryEntity> history = equipHistoryRepo.findAllByEqId(eqId);

        Map<String, Map<String, String>> sections = new LinkedHashMap<>();

        // ── Current record snapshot ───────────────────────────────────────
        Map<String, String> identity = new LinkedHashMap<>();
        identity.put("Equipment ID",            e.getEqId());
        identity.put("Name / Description",      e.getName());
        identity.put("Manufacturer",            nvl(e.getMake()));
        identity.put("Model / Type",            nvl(e.getModel()));
        identity.put("Serial Number",           nvl(e.getSerialNo()));
        identity.put("Firmware / SW Version",   nvl(e.getFirmwareVersion()));
        identity.put("Asset Tag",               nvl(e.getAssetTag()));
        identity.put("Measurement Range",       nvl(e.getMeasRange()));
        identity.put("Resolution",              nvl(e.getResolution()));
        identity.put("SOP Reference",           nvl(e.getSopReference()));
        identity.put("Commissioned Date",       e.getCommissionedDate() != null ? e.getCommissionedDate().format(FMT) : "—");
        sections.put("Cl. 6.4.13(a)(b) — Equipment Identity", identity);

        Map<String, String> status = new LinkedHashMap<>();
        status.put("Current Status",       nvl(e.getStatus()));
        status.put("Location",             nvl(e.getLocation()));
        status.put("Cal. Label No.",       nvl(e.getCalLabelNo()));
        status.put("Assigned Operator",    nvl(e.getAssignedTo()));
        status.put("Verified By",          nvl(e.getVerificationBy()));
        status.put("Verification Date",    e.getVerificationDate() != null ? e.getVerificationDate().format(FMT) : "—");
        status.put("Acceptance Criteria",  nvl(e.getAcceptanceCriteria()));
        sections.put("Cl. 6.4.13(c)(d) — Location & Status", status);

        Map<String, String> cal = new LinkedHashMap<>();
        cal.put("Last Calibration",        e.getLastCal() != null ? e.getLastCal().format(FMT) : "—");
        cal.put("Next Calibration Due",    e.getNextCal() != null ? e.getNextCal().format(FMT) : "—");
        cal.put("Calibration Interval",    nvl(e.getCalFrequency()));
        cal.put("Current Certificate No.", nvl(e.getCalCertNo()));
        cal.put("Calibration Result",      nvl(e.getCalResult()));
        cal.put("Calibrating Agency",      nvl(e.getCalSource()));
        cal.put("Correction Factor",       nvl(e.getCorrectionFactor()));
        cal.put("Reference Material",      nvl(e.getRefMaterial()));
        cal.put("Ref. Material Valid",     e.getRefValidityDate() != null ? e.getRefValidityDate().format(FMT) : "—");
        sections.put("Cl. 6.4.13(e)(f) — Current Calibration", cal);

        if (e.getTraceabilityStmt() != null && !e.getTraceabilityStmt().isBlank()) {
            Map<String, String> t = new LinkedHashMap<>();
            t.put("Traceability Statement", e.getTraceabilityStmt());
            sections.put("Cl. 6.4.6 — Metrological Traceability", t);
        }

        Map<String, String> maint = new LinkedHashMap<>();
        maint.put("Last Maintenance",      e.getLastMaintenance() != null ? e.getLastMaintenance().format(FMT) : "—");
        maint.put("Next Maintenance Due",  e.getNextMaintenance() != null ? e.getNextMaintenance().format(FMT) : "—");
        maint.put("Check Frequency",       nvl(e.getCheckFrequency()));
        if (e.getMaintenancePlan() != null && !e.getMaintenancePlan().isBlank())
            maint.put("Maintenance Plan",  e.getMaintenancePlan());
        if (e.getIntermediateCheck() != null && !e.getIntermediateCheck().isBlank())
            maint.put("Intermediate Check", e.getIntermediateCheck());
        sections.put("Cl. 6.4.13(g) — Maintenance", maint);

        if (e.getDamageHistory() != null && !e.getDamageHistory().isBlank()) {
            Map<String, String> dmg = new LinkedHashMap<>();
            dmg.put("History", e.getDamageHistory());
            sections.put("Cl. 6.4.13(h) — Damage & Repair Notes", dmg);
        }

        // ── Full event history ────────────────────────────────────────────
        if (!history.isEmpty()) {
            // Group by type for clean sections
            var byType = history.stream()
                .collect(Collectors.groupingBy(EquipmentHistoryEntity::getEventType));

            // ── Calibration history ─────────────────────────────────────────
            if (byType.containsKey("CALIBRATION")) {
                Map<String, String> calHist = new LinkedHashMap<>();
                int n = 1;
                for (EquipmentHistoryEntity h : byType.get("CALIBRATION")) {
                    StringBuilder sb = new StringBuilder();
                    sb.append("Date: ").append(h.getEventDate().format(FMT)).append("\n");
                    sb.append("Agency: ").append(nvl(h.getCalAgency())).append("\n");
                    sb.append("Certificate No.: ").append(nvl(h.getCalCertNo())).append("\n");
                    sb.append("Result: ").append(nvl(h.getCalResult())).append("\n");
                    if (h.getCalDueDate() != null)
                        sb.append("Next Cal Due: ").append(h.getCalDueDate().format(FMT)).append("\n");
                    if (h.getCorrectionFactor() != null && !h.getCorrectionFactor().isBlank())
                        sb.append("Correction Factor: ").append(h.getCorrectionFactor()).append("\n");
                    if (h.getTraceability() != null && !h.getTraceability().isBlank())
                        sb.append("Traceability: ").append(h.getTraceability()).append("\n");
                    sb.append("Performed By: ").append(nvl(h.getPerformedBy())).append("\n");
                    sb.append("Recorded By: ").append(nvl(h.getRecordedBy()));
                    calHist.put("Calibration #" + (n++), sb.toString());
                }
                sections.put("Calibration History — " + byType.get("CALIBRATION").size() + " events", calHist);
            }

            // ── Maintenance history ───────────────────────────────────────────
            if (byType.containsKey("MAINTENANCE")) {
                Map<String, String> maintHist = new LinkedHashMap<>();
                int n = 1;
                for (EquipmentHistoryEntity h : byType.get("MAINTENANCE")) {
                    StringBuilder sb = new StringBuilder();
                    sb.append("Date: ").append(h.getEventDate().format(FMT)).append("\n");
                    sb.append("Description: ").append(nvl(h.getDescription())).append("\n");
                    if (h.getWorkDone() != null && !h.getWorkDone().isBlank())
                        sb.append("Work Done: ").append(h.getWorkDone()).append("\n");
                    if (h.getPartsReplaced() != null && !h.getPartsReplaced().isBlank())
                        sb.append("Parts Replaced: ").append(h.getPartsReplaced()).append("\n");
                    if (h.getNextDueDate() != null)
                        sb.append("Next Due: ").append(h.getNextDueDate().format(FMT)).append("\n");
                    sb.append("Performed By: ").append(nvl(h.getPerformedBy()));
                    maintHist.put("Maintenance #" + (n++), sb.toString());
                }
                sections.put("Maintenance History — " + byType.get("MAINTENANCE").size() + " events", maintHist);
            }

            // ── Damage / Repair history (Cl. 6.4.9) ──────────────────────────
            List<String> damageTypes = List.of("DAMAGE", "REPAIR");
            List<EquipmentHistoryEntity> damageEvents = history.stream()
                .filter(h -> damageTypes.contains(h.getEventType()))
                .toList();
            if (!damageEvents.isEmpty()) {
                Map<String, String> dmgHist = new LinkedHashMap<>();
                int n = 1;
                for (EquipmentHistoryEntity h : damageEvents) {
                    StringBuilder sb = new StringBuilder();
                    sb.append("Date: ").append(h.getEventDate().format(FMT)).append("\n");
                    sb.append("Type: ").append(h.getEventType()).append("\n");
                    sb.append("Description: ").append(nvl(h.getDescription())).append("\n");
                    sb.append("Impact Level: ").append(nvl(h.getImpact())).append("\n");
                    if (h.getActionTaken() != null && !h.getActionTaken().isBlank())
                        sb.append("Action Taken: ").append(h.getActionTaken()).append("\n");
                    sb.append("Results Affected: ")
                        .append(Boolean.TRUE.equals(h.getResultsAffected()) ? "YES - NCR required" : "No")
                        .append("\n");
                    if (h.getNcrReference() != null && !h.getNcrReference().isBlank())
                        sb.append("NCR Reference: ").append(h.getNcrReference()).append("\n");
                    sb.append("Status: ").append(nvl(h.getStatusBefore()))
                        .append(" -> ").append(nvl(h.getStatusAfter())).append("\n");
                    if (Boolean.TRUE.equals(h.getReVerified())) {
                        sb.append("Re-verified By: ").append(nvl(h.getReVerifiedBy()));
                        if (h.getReVerifiedDate() != null)
                            sb.append(" on ").append(h.getReVerifiedDate().format(FMT));
                        sb.append("\n");
                    } else {
                        sb.append("Re-verification: Pending\n");
                    }
                    sb.append("Recorded By: ").append(nvl(h.getRecordedBy()));
                    dmgHist.put("Incident #" + (n++), sb.toString());
                }
                sections.put("Cl. 6.4.9/6.4.13(h) - Damage & Repair (" + damageEvents.size() + " incidents)", dmgHist);
            }

            // ── Intermediate checks (Cl. 6.4.10) ─────────────────────────────
            if (byType.containsKey("INTERMEDIATE_CHECK")) {
                Map<String, String> chkHist = new LinkedHashMap<>();
                int n = 1;
                for (EquipmentHistoryEntity h : byType.get("INTERMEDIATE_CHECK")) {
                    StringBuilder sb = new StringBuilder();
                    sb.append("Date: ").append(h.getEventDate().format(FMT)).append("\n");
                    sb.append("Result: ").append(nvl(h.getDescription())).append("\n");
                    sb.append("Performed By: ").append(nvl(h.getPerformedBy()));
                    chkHist.put("Check #" + (n++), sb.toString());
                }
                sections.put("Cl. 6.4.10 - Intermediate Checks (" + byType.get("INTERMEDIATE_CHECK").size() + " entries)", chkHist);
            }

            // ── Status changes ────────────────────────────────────────────────
            if (byType.containsKey("STATUS_CHANGE")) {
                Map<String, String> scHist = new LinkedHashMap<>();
                int n = 1;
                for (EquipmentHistoryEntity h : byType.get("STATUS_CHANGE")) {
                    String entry = h.getEventDate().format(FMT) + ": "
                        + nvl(h.getStatusBefore()) + " -> " + nvl(h.getStatusAfter())
                        + " - " + nvl(h.getDescription())
                        + " (by " + nvl(h.getPerformedBy()) + ")";
                    scHist.put("Change #" + (n++), entry);
                }
                sections.put("Status Change Log", scHist);
            }

        } else {
            Map<String, String> noHistory = new LinkedHashMap<>();
            noHistory.put("Note", "No events have been logged yet. Use the Add Event button in the Equipment module to begin recording the history log.");
            sections.put("Event History", noHistory);
        }

        byte[] bytes = pdf.generateDocument(
            "Equipment History & Calibration Record",
            e.getEqId() + " — " + e.getName(),
            null,
            sections,
            "Full equipment history record maintained per ISO/IEC 17025:2017 Cl. 6.4.13(a-h). " +
            "Total events recorded: " + history.size() + ". " +
            "Printed: " + LocalDate.now().format(FMT) + "."
        );
        return pdfResponse(bytes, "Equipment-FullHistory-" + eqId + ".pdf");
    }

    // ── NCR Report ────────────────────────────────────────────────────────
    @GetMapping("/ncr/{ncrId}")
    public ResponseEntity<byte[]> ncr(@PathVariable String ncrId) {
        var e = ncrRepo.findByNcrId(ncrId)
            .orElseThrow(() -> new IllegalArgumentException("NCR not found: " + ncrId));

        Map<String, Map<String, String>> sections = new LinkedHashMap<>();

        Map<String, String> info = new LinkedHashMap<>();
        info.put("NCR ID",      e.getNcrId());
        info.put("Area",        nvl(e.getArea()));
        info.put("Severity",    nvl(e.getSeverity()));
        info.put("Status",      nvl(e.getStatus()));
        info.put("Raised Date", e.getRaisedDate() != null ? e.getRaisedDate().format(FMT) : "—");
        info.put("Assignee",    nvl(e.getAssignee()));
        info.put("Due Date",    e.getDueDate() != null ? e.getDueDate().format(FMT) : "—");
        sections.put("Non-Conformance Details", info);

        Map<String, String> finding = new LinkedHashMap<>();
        finding.put("Finding", nvl(e.getFinding()));
        sections.put("Finding", finding);

        if (e.getRootCause() != null && !e.getRootCause().isBlank()) {
            Map<String, String> rc = new LinkedHashMap<>();
            rc.put("Root Cause", e.getRootCause());
            sections.put("Root Cause Analysis", rc);
        }

        if (e.getCorrectiveAction() != null && !e.getCorrectiveAction().isBlank()) {
            Map<String, String> ca = new LinkedHashMap<>();
            ca.put("Corrective Action", e.getCorrectiveAction());
            if (e.getClosedDate() != null) ca.put("Closed Date", e.getClosedDate().format(FMT));
            sections.put("Corrective Action", ca);
        }

        byte[] bytes = pdf.generateDocument(
            "Non-Conformance Report", e.getNcrId(), null, sections,
            "NCR managed in accordance with ISO/IEC 17025 : 2017 Clause 8.6 — Nonconforming work and Clause 8.7 — Control of nonconforming work."
        );
        return pdfResponse(bytes, "NCR-" + ncrId + ".pdf");
    }

    // ── Document Register ─────────────────────────────────────────────────
    @GetMapping("/document-register")
    public ResponseEntity<byte[]> documentRegister() {
        var docs = docRepo.findAll();

        // Build as one big section — each doc as a row
        Map<String, Map<String, String>> sections = new LinkedHashMap<>();
        Map<String, String> rows = new LinkedHashMap<>();
        rows.put("Total Documents", String.valueOf(docs.size()));
        rows.put("Print Date", LocalDate.now().format(FMT));
        sections.put("Register Summary", rows);

        // Group by status
        Map<String, String> active = new LinkedHashMap<>();
        Map<String, String> draft  = new LinkedHashMap<>();
        Map<String, String> other  = new LinkedHashMap<>();

        for (var d : docs) {
            String entry = d.getTitle() + " — v" + d.getVersion()
                + (d.getReviewDue() != null ? " (Review: " + d.getReviewDue().format(FMT) + ")" : "");
            if ("ACTIVE".equalsIgnoreCase(d.getStatus()))           active.put(d.getDocId(), entry);
            else if ("DRAFT".equalsIgnoreCase(d.getStatus()))       draft.put(d.getDocId(), entry);
            else                                                     other.put(d.getDocId(), entry);
        }

        if (!active.isEmpty()) sections.put("Active Documents (" + active.size() + ")", active);
        if (!draft.isEmpty())  sections.put("Draft Documents ("  + draft.size()  + ")", draft);
        if (!other.isEmpty())  sections.put("Other Status ("     + other.size()  + ")", other);

        byte[] bytes = pdf.generateDocument(
            "Document Register", "QMS-REG-001", null, sections,
            "Document register maintained in accordance with ISO/IEC 17025 : 2017 Clause 8.3 — Control of management system documents."
        );
        return pdfResponse(bytes, "Document-Register-" + LocalDate.now() + ".pdf");
    }

    // ── Personnel Record ──────────────────────────────────────────────────
    @GetMapping("/personnel/{empId}")
    public ResponseEntity<byte[]> personnel(@PathVariable String empId) {
        var e = personnelRepo.findByEmpId(empId)
            .orElseThrow(() -> new IllegalArgumentException("Personnel not found: " + empId));

        Map<String, Map<String, String>> sections = new LinkedHashMap<>();

        Map<String, String> info = new LinkedHashMap<>();
        info.put("Employee ID",   e.getEmpId());
        info.put("Full Name",     e.getFullName());
        info.put("Designation",   nvl(e.getDesignation()));
        info.put("Department",    nvl(e.getDepartment()));
        info.put("Email",         nvl(e.getEmail()));
        info.put("Phone",         nvl(e.getPhone()));
        info.put("Joined Date",   e.getJoinedDate() != null ? e.getJoinedDate().format(FMT) : "—");
        info.put("Status",        nvl(e.getStatus()));
        sections.put("Personnel Details", info);

        if (e.getQualification() != null && !e.getQualification().isBlank()) {
            Map<String, String> qual = new LinkedHashMap<>();
            qual.put("Qualification", e.getQualification());
            sections.put("Qualifications & Competency", qual);
        }

        byte[] bytes = pdf.generateDocument(
            "Personnel Record", e.getEmpId(), null, sections,
            "Personnel records maintained in accordance with ISO/IEC 17025 : 2017 Clause 6.2 — Personnel."
        );
        return pdfResponse(bytes, "Personnel-" + empId + ".pdf");
    }

    private String nvl(String s) { return s != null && !s.isBlank() ? s : "—"; }
}
