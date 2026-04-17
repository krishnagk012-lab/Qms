-- V10: Method Register — ISO 17025:2017 Clause 7.2

CREATE TABLE IF NOT EXISTS methods (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    method_id           VARCHAR(20) UNIQUE NOT NULL,     -- e.g. MTH-001
    title               VARCHAR(200) NOT NULL,            -- Full method title
    method_type         VARCHAR(20) NOT NULL,             -- STANDARD | IN_HOUSE | MODIFIED
    standard_ref        VARCHAR(100),                     -- e.g. IS 3025 Part 11, ISO 5667-3
    parameter           VARCHAR(150),                     -- What is being measured
    matrix              VARCHAR(100),                     -- Sample type: water, soil, food, air
    scope               TEXT,                             -- Detailed scope statement
    accreditation_status VARCHAR(20) DEFAULT 'PENDING',   -- ACCREDITED | PENDING | INTERNAL_ONLY | WITHDRAWN

    -- Cl. 7.2.1 — Method selection
    selection_basis     TEXT,                             -- Why this method was selected
    applicable_to       TEXT,                             -- Which tests use this method

    -- Cl. 7.2.2 — Validation
    validation_type     VARCHAR(20),                      -- VALIDATION | VERIFICATION
    validation_status   VARCHAR(20) DEFAULT 'NOT_DONE',   -- COMPLETED | IN_PROGRESS | NOT_DONE
    validation_date     DATE,
    validated_by        VARCHAR(120),
    validation_ref      VARCHAR(80),                      -- Reference to validation report doc

    -- Validation parameters recorded
    val_linearity       BOOLEAN DEFAULT FALSE,
    val_precision       BOOLEAN DEFAULT FALSE,
    val_accuracy        BOOLEAN DEFAULT FALSE,
    val_selectivity     BOOLEAN DEFAULT FALSE,
    val_lod_loq         BOOLEAN DEFAULT FALSE,
    val_ruggedness      BOOLEAN DEFAULT FALSE,
    val_uncertainty     BOOLEAN DEFAULT FALSE,

    -- Performance characteristics
    working_range       VARCHAR(100),                     -- e.g. 0.1–100 mg/L
    lod                 VARCHAR(60),                      -- Limit of Detection
    loq                 VARCHAR(60),                      -- Limit of Quantitation
    precision_rsd       VARCHAR(60),                      -- Repeatability RSD %
    bias_percent        VARCHAR(60),                      -- Bias / Recovery %
    uncertainty_k2      VARCHAR(100),                     -- Expanded uncertainty at k=2

    -- Equipment & reagents
    required_equipment  TEXT,
    required_reagents   TEXT,

    -- Deviation management Cl. 7.2.1.5
    deviations_approved TEXT,

    -- Control
    sop_reference       VARCHAR(80),
    responsible_person  VARCHAR(120),
    status              VARCHAR(20) DEFAULT 'ACTIVE',     -- ACTIVE | UNDER_REVIEW | WITHDRAWN
    effective_date      DATE,
    review_date         DATE,
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_methods_status ON methods(status);
CREATE INDEX IF NOT EXISTS idx_methods_type   ON methods(method_type);
