package com.qmssuite.equipment.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity @Table(name="equipment_history")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class EquipmentHistoryEntity {
    @Id @GeneratedValue(strategy=GenerationType.UUID)
    private UUID id;

    @Column(name="eq_id", nullable=false, length=20)
    private String eqId;

    @Column(name="event_type", nullable=false, length=30)
    private String eventType;

    @Column(name="event_date", nullable=false)
    private LocalDate eventDate;

    @Column(name="performed_by", length=120)
    private String performedBy;

    @Column(name="recorded_by", length=120)
    private String recordedBy;

    @Column(name="recorded_at")
    private Instant recordedAt = Instant.now();

    // Calibration fields
    @Column(name="cal_cert_no",  length=80)  private String calCertNo;
    @Column(name="cal_agency",   length=150) private String calAgency;
    @Column(name="cal_result",   length=20)  private String calResult;
    @Column(name="cal_due_date")             private LocalDate calDueDate;
    @Column(name="correction_factor", length=150) private String correctionFactor;
    @Column(name="traceability", columnDefinition="TEXT") private String traceability;

    // Maintenance fields
    @Column(name="work_done",     columnDefinition="TEXT") private String workDone;
    @Column(name="parts_replaced",columnDefinition="TEXT") private String partsReplaced;
    @Column(name="next_due_date")                          private LocalDate nextDueDate;

    // Description (all events)
    @Column(name="description", nullable=false, columnDefinition="TEXT")
    private String description;

    @Column(length=30) private String impact;
    @Column(name="action_taken", columnDefinition="TEXT") private String actionTaken;
    @Column(name="ncr_reference", length=30) private String ncrReference;

    // Outcome
    @Column(name="status_before", length=30) private String statusBefore;
    @Column(name="status_after",  length=30) private String statusAfter;
    @Column(name="results_affected") private Boolean resultsAffected = false;
    @Column(name="re_verified")      private Boolean reVerified = false;
    @Column(name="re_verified_by", length=120) private String reVerifiedBy;
    @Column(name="re_verified_date")           private LocalDate reVerifiedDate;
    @Column(name="cert_file_ref", length=500)  private String certFileRef;
}
