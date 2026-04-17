-- V8: Extend personnel table with all ISO 17025 Cl. 6.2 required fields

-- Cl. 6.2.2 — Competence requirements documented per function
ALTER TABLE personnel ADD COLUMN IF NOT EXISTS competence_requirements TEXT;
ALTER TABLE personnel ADD COLUMN IF NOT EXISTS technical_knowledge      TEXT;
ALTER TABLE personnel ADD COLUMN IF NOT EXISTS skills                   TEXT;
ALTER TABLE personnel ADD COLUMN IF NOT EXISTS experience_years         INTEGER;

-- Cl. 6.2.3 — Competency to perform laboratory activities
ALTER TABLE personnel ADD COLUMN IF NOT EXISTS competency_assessed_date DATE;
ALTER TABLE personnel ADD COLUMN IF NOT EXISTS competency_assessed_by   VARCHAR(120);
ALTER TABLE personnel ADD COLUMN IF NOT EXISTS competency_status        VARCHAR(30); -- COMPETENT | UNDER_SUPERVISION | NOT_YET_ASSESSED | REQUIRES_TRAINING

-- Cl. 6.2.4 — Duties, responsibilities and authorities communicated
ALTER TABLE personnel ADD COLUMN IF NOT EXISTS job_description_ref      VARCHAR(80);
ALTER TABLE personnel ADD COLUMN IF NOT EXISTS responsibilities         TEXT;
ALTER TABLE personnel ADD COLUMN IF NOT EXISTS reporting_to             VARCHAR(120);

-- Cl. 6.2.5(d) — Supervision
ALTER TABLE personnel ADD COLUMN IF NOT EXISTS supervised_by            VARCHAR(120);
ALTER TABLE personnel ADD COLUMN IF NOT EXISTS supervision_level        VARCHAR(30); -- INDEPENDENT | SUPERVISED | TRAINEE

-- Cl. 6.2.5(e) — Authorization of personnel
ALTER TABLE personnel ADD COLUMN IF NOT EXISTS authorised_activities    TEXT;  -- comma-separated list of what they are authorised to do
ALTER TABLE personnel ADD COLUMN IF NOT EXISTS authorised_by            VARCHAR(120);
ALTER TABLE personnel ADD COLUMN IF NOT EXISTS authorised_date          DATE;
ALTER TABLE personnel ADD COLUMN IF NOT EXISTS authorisation_expiry     DATE;

-- Cl. 6.2.5(f) — Monitoring competence
ALTER TABLE personnel ADD COLUMN IF NOT EXISTS last_competency_review   DATE;
ALTER TABLE personnel ADD COLUMN IF NOT EXISTS next_competency_review   DATE;
ALTER TABLE personnel ADD COLUMN IF NOT EXISTS competency_notes         TEXT;

-- Additional HR fields
ALTER TABLE personnel ADD COLUMN IF NOT EXISTS employee_type            VARCHAR(20); -- INTERNAL | EXTERNAL | CONTRACT
ALTER TABLE personnel ADD COLUMN IF NOT EXISTS signature_ref            VARCHAR(200); -- file reference for signature
