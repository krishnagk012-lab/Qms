-- V7: Equipment History Log — full event trail per ISO 17025 Cl. 6.4.13
-- Every calibration, maintenance, repair, damage, inspection, and status change
-- is stored as an immutable event row. The PDF pulls the complete history.

CREATE TABLE equipment_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    eq_id           VARCHAR(20) NOT NULL REFERENCES equipment(eq_id) ON DELETE CASCADE,

    -- Event classification
    event_type      VARCHAR(30) NOT NULL,
    -- Values: CALIBRATION | MAINTENANCE | REPAIR | DAMAGE | INSPECTION |
    --         INTERMEDIATE_CHECK | STATUS_CHANGE | MODIFICATION | DECOMMISSION | RECOMMISSION

    event_date      DATE NOT NULL,
    performed_by    VARCHAR(120),        -- person who did the work
    recorded_by     VARCHAR(120),        -- person who logged this entry
    recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Calibration-specific (Cl. 6.4.13e)
    cal_cert_no     VARCHAR(80),
    cal_agency      VARCHAR(150),
    cal_result      VARCHAR(20),         -- PASS | FAIL | CONDITIONAL
    cal_due_date    DATE,
    correction_factor VARCHAR(150),
    traceability    TEXT,

    -- Maintenance-specific (Cl. 6.4.13g)
    work_done       TEXT,                -- description of work performed
    parts_replaced  TEXT,
    next_due_date   DATE,

    -- Damage/repair (Cl. 6.4.13h)
    description     TEXT NOT NULL,       -- full description of the event
    impact          VARCHAR(30),         -- NONE | LOW | MEDIUM | HIGH | CRITICAL
    action_taken    TEXT,
    ncr_reference   VARCHAR(30),         -- linked NCR if results were affected

    -- Outcome
    status_before   VARCHAR(30),
    status_after    VARCHAR(30),
    results_affected BOOLEAN DEFAULT FALSE,
    re_verified     BOOLEAN DEFAULT FALSE,
    re_verified_by  VARCHAR(120),
    re_verified_date DATE,

    -- Attachments (certificate file reference)
    cert_file_ref   VARCHAR(500),

    CONSTRAINT chk_event_type CHECK (event_type IN (
        'CALIBRATION','MAINTENANCE','REPAIR','DAMAGE',
        'INSPECTION','INTERMEDIATE_CHECK','STATUS_CHANGE',
        'MODIFICATION','DECOMMISSION','RECOMMISSION','OTHER'
    ))
);

CREATE INDEX idx_eq_history_eq_id     ON equipment_history(eq_id);
CREATE INDEX idx_eq_history_event_date ON equipment_history(event_date DESC);
CREATE INDEX idx_eq_history_type      ON equipment_history(event_type);
