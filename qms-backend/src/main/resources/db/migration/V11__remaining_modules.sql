-- V11: Remaining ISO 17025:2017 modules

-- ── Cl. 6.6 Supplier / Vendor Register ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id     VARCHAR(20) UNIQUE NOT NULL,
    name            VARCHAR(150) NOT NULL,
    supplier_type   VARCHAR(30) NOT NULL, -- CALIBRATION_LAB | REAGENT | EQUIPMENT | SUBCONTRACTOR | CRM | OTHER
    contact_person  VARCHAR(120),
    email           VARCHAR(120),
    phone           VARCHAR(30),
    address         TEXT,
    accreditation_no VARCHAR(80),   -- e.g. NABL CC-1234
    accreditation_body VARCHAR(80), -- e.g. NABL
    accreditation_expiry DATE,
    scope_of_supply TEXT,
    evaluation_status VARCHAR(20) DEFAULT 'PENDING', -- APPROVED | CONDITIONAL | REJECTED | PENDING
    evaluation_date DATE,
    evaluated_by    VARCHAR(120),
    evaluation_criteria TEXT,
    re_evaluation_due DATE,
    status          VARCHAR(20) DEFAULT 'ACTIVE',
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Cl. 8.9 Management Review ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS management_reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id       VARCHAR(20) UNIQUE NOT NULL,
    review_date     DATE NOT NULL,
    chaired_by      VARCHAR(120),
    attendees       TEXT,
    next_review_date DATE,
    -- Cl. 8.9.2 input items
    input_policy_objectives TEXT,
    input_previous_actions  TEXT,
    input_recent_results    TEXT,
    input_nonconformities   TEXT,
    input_proficiency       TEXT,
    input_risk_actions      TEXT,
    input_workload          TEXT,
    input_complaints        TEXT,
    input_resources         TEXT,
    input_supplier          TEXT,
    input_audit_findings    TEXT,
    input_external_changes  TEXT,
    -- Cl. 8.9.3 outputs
    output_qms_effectiveness TEXT,
    output_improvements      TEXT,
    output_resource_needs    TEXT,
    output_action_items      TEXT,
    status          VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT | APPROVED
    approved_by     VARCHAR(120),
    approved_date   DATE,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Cl. 7.9 Complaints Register ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS complaints (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id    VARCHAR(20) UNIQUE NOT NULL,
    received_date   DATE NOT NULL,
    complainant     VARCHAR(150),
    contact         VARCHAR(120),
    complaint_type  VARCHAR(30), -- RESULT | SERVICE | TURNAROUND | STAFF | OTHER
    description     TEXT NOT NULL,
    related_report  VARCHAR(50),
    severity        VARCHAR(20) DEFAULT 'MEDIUM', -- LOW | MEDIUM | HIGH | CRITICAL
    status          VARCHAR(20) DEFAULT 'OPEN',   -- OPEN | INVESTIGATING | RESOLVED | CLOSED
    assigned_to     VARCHAR(120),
    investigation   TEXT,
    root_cause      TEXT,
    corrective_action TEXT,
    response_date   DATE,
    response_sent   BOOLEAN DEFAULT FALSE,
    closed_date     DATE,
    ncr_reference   VARCHAR(30),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Cl. 7.4 Sample Handling Log ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS samples (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sample_id       VARCHAR(30) UNIQUE NOT NULL,
    received_date   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    received_by     VARCHAR(120),
    client          VARCHAR(150),
    sample_description TEXT,
    matrix          VARCHAR(80),
    quantity        VARCHAR(60),
    condition_on_arrival VARCHAR(30), -- ACCEPTABLE | COMPROMISED | REJECTED
    condition_notes TEXT,
    storage_location VARCHAR(80),
    storage_temp    VARCHAR(30),
    tests_requested TEXT,
    method_references TEXT,
    priority        VARCHAR(20) DEFAULT 'NORMAL', -- URGENT | NORMAL | ROUTINE
    status          VARCHAR(20) DEFAULT 'RECEIVED', -- RECEIVED | IN_TESTING | COMPLETED | DISPOSED
    disposal_date   DATE,
    disposal_method VARCHAR(80),
    disposal_by     VARCHAR(120),
    linked_report   VARCHAR(50),
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Cl. 6.5 Metrological Traceability Register ───────────────────────────────
CREATE TABLE IF NOT EXISTS traceability_chains (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chain_id        VARCHAR(20) UNIQUE NOT NULL,
    parameter       VARCHAR(150) NOT NULL,
    unit            VARCHAR(30),
    measurement_level VARCHAR(150),    -- Our lab's measurement
    -- Chain links (3 levels is typical)
    link1_lab       VARCHAR(150),      -- e.g. NABL-accredited cal lab
    link1_cert_no   VARCHAR(80),
    link1_standard  VARCHAR(150),
    link2_lab       VARCHAR(150),      -- e.g. CSIR-NPL
    link2_cert_no   VARCHAR(80),
    link2_standard  VARCHAR(150),
    link3_lab       VARCHAR(150),      -- e.g. BIPM / NIST
    link3_standard  VARCHAR(150),
    si_unit         VARCHAR(80),       -- Final SI link
    valid_until     DATE,
    verified_by     VARCHAR(120),
    linked_equipment VARCHAR(200),     -- Comma-separated EQ IDs
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Cl. 7.6 Uncertainty Budgets ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS uncertainty_budgets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id       VARCHAR(20) UNIQUE NOT NULL,
    method_id       VARCHAR(20),       -- FK to methods
    parameter       VARCHAR(150) NOT NULL,
    unit            VARCHAR(30),
    measurand       TEXT,
    approach        VARCHAR(20) DEFAULT 'GUM', -- GUM | EMPIRICAL | INTERLAB
    components      JSONB,             -- Array of {source, type, value, distribution, sensitivity, u_contribution}
    combined_u      NUMERIC(12,6),     -- Combined standard uncertainty
    coverage_factor NUMERIC(4,2) DEFAULT 2.0,
    expanded_u      NUMERIC(12,6),     -- U = k * uc
    confidence_level VARCHAR(10) DEFAULT '95%',
    approved_by     VARCHAR(120),
    approved_date   DATE,
    review_date     DATE,
    status          VARCHAR(20) DEFAULT 'DRAFT',
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Cl. 5.4 Scope of Accreditation ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS accreditation_scope (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope_id        VARCHAR(20) UNIQUE NOT NULL,
    nabl_cert_no    VARCHAR(80),
    parameter       VARCHAR(150) NOT NULL,
    method_ref      VARCHAR(100),
    matrix          VARCHAR(100),
    range_from      VARCHAR(80),
    range_to        VARCHAR(80),
    unit            VARCHAR(30),
    uncertainty     VARCHAR(100),
    facility        VARCHAR(100),
    accredited_since DATE,
    valid_until     DATE,
    status          VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE | SUSPENDED | WITHDRAWN
    linked_method_id VARCHAR(20),
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Cl. 5.1-5.5 Organisation Structure ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS organisation_roles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id         VARCHAR(20) UNIQUE NOT NULL,
    role_title      VARCHAR(100) NOT NULL,         -- e.g. Technical Manager
    iso_ref         VARCHAR(20),                   -- e.g. Cl.5.5.1
    incumbent       VARCHAR(120),                  -- Current person in role
    emp_id          VARCHAR(20),
    responsibilities TEXT,
    authorities     TEXT,
    appointed_by    VARCHAR(120),
    appointment_date DATE,
    deputy          VARCHAR(120),                  -- Deputy when absent
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_type   ON suppliers(supplier_type);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_samples_status   ON samples(status);
