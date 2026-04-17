-- QMS Suite Database Schema
-- Flyway V1 — Initial schema
-- ISO 17025:2017 compliant structure

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ── Users & Auth ──────────────────────────────────────────────────────────────
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username      VARCHAR(50)  UNIQUE NOT NULL,
    full_name     VARCHAR(120) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'ANALYST',
    department    VARCHAR(80),
    email         VARCHAR(120) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login    TIMESTAMPTZ
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role     ON users(role);

-- ── Documents  (Clause 8.3) ───────────────────────────────────────────────────
CREATE TABLE documents (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_id        VARCHAR(30) UNIQUE NOT NULL,
    title         VARCHAR(200) NOT NULL,
    category      VARCHAR(60)  NOT NULL,
    version       VARCHAR(10)  NOT NULL DEFAULT 'v1.0',
    status        VARCHAR(20)  NOT NULL DEFAULT 'DRAFT',
    issue_date    DATE,
    review_due    DATE,
    owner         VARCHAR(120),
    description   TEXT,
    file_path     VARCHAR(500),
    created_by    UUID REFERENCES users(id),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_status     ON documents(status);
CREATE INDEX idx_documents_review_due ON documents(review_due);
CREATE INDEX idx_documents_category   ON documents(category);

-- ── Equipment  (Clause 6.4) ───────────────────────────────────────────────────
CREATE TABLE equipment (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    eq_id          VARCHAR(20) UNIQUE NOT NULL,
    name           VARCHAR(150) NOT NULL,
    make           VARCHAR(80),
    model          VARCHAR(80),
    serial_no      VARCHAR(80),
    location       VARCHAR(30),
    status         VARCHAR(25)  NOT NULL DEFAULT 'CALIBRATED',
    last_cal       DATE,
    next_cal       DATE,
    cal_frequency  VARCHAR(20),
    cal_source     VARCHAR(80),
    notes          TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_equipment_status   ON equipment(status);
CREATE INDEX idx_equipment_next_cal ON equipment(next_cal);

CREATE TABLE calibration_log (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    eq_id         VARCHAR(20) NOT NULL REFERENCES equipment(eq_id) ON DELETE CASCADE,
    cal_date      DATE NOT NULL,
    next_due      DATE,
    performed_by  VARCHAR(120),
    cal_source    VARCHAR(80),
    certificate   VARCHAR(200),
    result        VARCHAR(20) DEFAULT 'PASS',
    notes         TEXT,
    created_by    UUID REFERENCES users(id),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Personnel  (Clause 6.2) ───────────────────────────────────────────────────
CREATE TABLE personnel (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emp_id        VARCHAR(20) UNIQUE NOT NULL,
    full_name     VARCHAR(120) NOT NULL,
    designation   VARCHAR(80),
    department    VARCHAR(80),
    qualification VARCHAR(150),
    joined_date   DATE,
    status        VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    email         VARCHAR(120),
    phone         VARCHAR(20),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE training_records (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_id    VARCHAR(20) UNIQUE NOT NULL,
    title          VARCHAR(200) NOT NULL,
    training_type  VARCHAR(60),
    date_completed DATE,
    next_due       DATE,
    applicable_to  VARCHAR(120),
    status         VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    notes          TEXT,
    created_by     UUID REFERENCES users(id),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Test Records  (Clause 7.5) ────────────────────────────────────────────────
CREATE TABLE test_records (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id      VARCHAR(20) UNIQUE NOT NULL,
    test_name    VARCHAR(200) NOT NULL,
    sample_id    VARCHAR(50),
    client       VARCHAR(150),
    start_date   DATE,
    end_date     DATE,
    analyst      VARCHAR(120),
    result       VARCHAR(25) DEFAULT 'IN_PROGRESS',
    stage        VARCHAR(25) DEFAULT 'ACTIVE',
    method       VARCHAR(100),
    parameters   JSONB,
    notes        TEXT,
    created_by   UUID REFERENCES users(id),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_test_records_result ON test_records(result);
CREATE INDEX idx_test_records_stage  ON test_records(stage);
CREATE INDEX idx_test_records_client ON test_records USING gin(to_tsvector('english', client));

-- ── Measurement Uncertainty  (Clause 7.6) ─────────────────────────────────────
CREATE TABLE uncertainty_budgets (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id    VARCHAR(20) UNIQUE NOT NULL,
    measurand    VARCHAR(200) NOT NULL,
    method       VARCHAR(100),
    analyst      VARCHAR(120),
    k_factor     NUMERIC(5,3) DEFAULT 2.0,
    u_combined   NUMERIC(15,8),
    u_expanded   NUMERIC(15,8),
    status       VARCHAR(20) DEFAULT 'DRAFT',
    created_by   UUID REFERENCES users(id),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE uncertainty_sources (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id    UUID NOT NULL REFERENCES uncertainty_budgets(id) ON DELETE CASCADE,
    source_name  VARCHAR(200) NOT NULL,
    source_type  CHAR(1) NOT NULL DEFAULT 'B',
    value        NUMERIC(15,8) NOT NULL,
    unit         VARCHAR(30),
    divisor      NUMERIC(10,6) NOT NULL DEFAULT 1.732051,
    sensitivity  NUMERIC(10,6) NOT NULL DEFAULT 1.0,
    sort_order   INTEGER DEFAULT 0
);

-- ── Proficiency Testing  (Clause 7.7) ─────────────────────────────────────────
CREATE TABLE pt_schemes (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_id    VARCHAR(20) UNIQUE NOT NULL,
    scheme_name  VARCHAR(200) NOT NULL,
    provider     VARCHAR(100),
    parameter    VARCHAR(150),
    frequency    VARCHAR(30),
    status       VARCHAR(20) DEFAULT 'ACTIVE',
    next_round   DATE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pt_results (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    result_id        VARCHAR(25) UNIQUE NOT NULL,
    scheme_id        UUID NOT NULL REFERENCES pt_schemes(id),
    round_no         VARCHAR(20),
    assigned_value   NUMERIC(15,6),
    lab_result       NUMERIC(15,6),
    uncertainty      NUMERIC(15,6),
    std_dev          NUMERIC(15,8),
    z_score          NUMERIC(8,4),
    en_number        NUMERIC(8,4),
    status           VARCHAR(20) DEFAULT 'PENDING',
    submission_date  DATE,
    analyst          VARCHAR(120),
    notes            TEXT,
    created_by       UUID REFERENCES users(id),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── NCR / Audit / CAPA  (Clause 8.6–8.8) ─────────────────────────────────────
CREATE TABLE ncrs (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ncr_id            VARCHAR(20) UNIQUE NOT NULL,
    finding           TEXT NOT NULL,
    area              VARCHAR(60),
    severity          VARCHAR(10) DEFAULT 'MINOR',
    status            VARCHAR(20) DEFAULT 'OPEN',
    raised_date       DATE,
    assignee          VARCHAR(120),
    due_date          DATE,
    root_cause        TEXT,
    corrective_action TEXT,
    closed_date       DATE,
    closed_by         UUID REFERENCES users(id),
    raised_by         UUID REFERENCES users(id),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audits (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id      VARCHAR(20) UNIQUE NOT NULL,
    scope         VARCHAR(200) NOT NULL,
    start_date    DATE,
    end_date      DATE,
    lead_auditor  VARCHAR(120),
    status        VARCHAR(20) DEFAULT 'SCHEDULED',
    score         VARCHAR(10),
    ncr_count     INTEGER DEFAULT 0,
    notes         TEXT,
    created_by    UUID REFERENCES users(id),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Risk Management  (Clause 8.5) ─────────────────────────────────────────────
CREATE TABLE risks (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_id          VARCHAR(20) UNIQUE NOT NULL,
    description      TEXT NOT NULL,
    area             VARCHAR(60),
    likelihood       SMALLINT DEFAULT 3 CHECK (likelihood BETWEEN 1 AND 5),
    impact           SMALLINT DEFAULT 3 CHECK (impact BETWEEN 1 AND 5),
    risk_score       SMALLINT GENERATED ALWAYS AS (likelihood * impact) STORED,
    level            VARCHAR(10) DEFAULT 'MEDIUM',
    treatment        VARCHAR(20) DEFAULT 'MITIGATE',
    status           VARCHAR(20) DEFAULT 'OPEN',
    control_measure  TEXT,
    created_by       UUID REFERENCES users(id),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Reports & Certificates  (Clause 7.8) ──────────────────────────────────────
CREATE TABLE reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_no       VARCHAR(30) UNIQUE NOT NULL,
    report_type     VARCHAR(30) DEFAULT 'TEST_REPORT',
    test_name       VARCHAR(200),
    sample_id       VARCHAR(50),
    client          VARCHAR(150),
    issue_date      DATE,
    analyst         VARCHAR(120),
    authorised_by   VARCHAR(120),
    status          VARCHAR(25) DEFAULT 'DRAFT',
    validity        VARCHAR(60),
    pdf_path        VARCHAR(500),
    uncertainty_stmt TEXT,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Immutable Audit Trail ─────────────────────────────────────────────────────
CREATE TABLE audit_trail (
    id          BIGSERIAL PRIMARY KEY,
    event_time  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    username    VARCHAR(50) NOT NULL,
    action      VARCHAR(30) NOT NULL,
    table_name  VARCHAR(60),
    record_id   VARCHAR(50),
    old_value   JSONB,
    new_value   JSONB,
    ip_address  VARCHAR(45)
);

CREATE INDEX idx_audit_trail_username   ON audit_trail(username);
CREATE INDEX idx_audit_trail_event_time ON audit_trail(event_time DESC);
CREATE INDEX idx_audit_trail_table      ON audit_trail(table_name, record_id);
