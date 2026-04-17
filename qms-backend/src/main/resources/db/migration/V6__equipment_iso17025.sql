-- V6: Extend equipment table with all ISO 17025 Cl. 6.4.13 required fields

-- Cl. 6.4.13(a) — identity incl. software/firmware
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS firmware_version    VARCHAR(50);
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS asset_tag           VARCHAR(50);

-- Cl. 6.4.13(b) — manufacturer type identification already exists (make/model/serial_no)

-- Cl. 6.4.13(c) — verification on placement into service
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS verification_date   DATE;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS verification_by     VARCHAR(120);
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS acceptance_criteria TEXT;

-- Cl. 6.4.5 — measurement range & resolution
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS meas_range          VARCHAR(100);
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS resolution          VARCHAR(60);

-- Cl. 6.4.13(e) — calibration certificate + correction factors
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS cal_cert_no         VARCHAR(80);
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS cal_result          VARCHAR(30);   -- PASS/FAIL/CONDITIONAL
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS correction_factor   VARCHAR(100);
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS traceability_stmt   TEXT;          -- metrological traceability

-- Cl. 6.4.13(f) — reference materials
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS ref_material        VARCHAR(200);
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS ref_validity_date   DATE;

-- Cl. 6.4.13(g) — maintenance plan
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS maintenance_plan    TEXT;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS last_maintenance    DATE;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS next_maintenance    DATE;

-- Cl. 6.4.13(h) — damage / modification / repair history
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS damage_history      TEXT;

-- Cl. 6.4.8 — labelling / identification for calibration status
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS cal_label_no        VARCHAR(50);

-- Cl. 6.4.10 — intermediate check procedure
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS intermediate_check  TEXT;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS check_frequency     VARCHAR(30);

-- Assigned personnel + SOP reference (NABL assessor expectation)
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS assigned_to         VARCHAR(120);
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS sop_reference       VARCHAR(80);

-- Purchase / commission info
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS purchase_date       DATE;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS commissioned_date   DATE;
