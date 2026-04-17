-- ── V5: Organisation / Lab registration ──────────────────────────────────────

CREATE TABLE organisations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL,
    short_name      VARCHAR(60),
    nabl_cert_no    VARCHAR(60),
    address         TEXT,
    city            VARCHAR(80),
    state           VARCHAR(80),
    country         VARCHAR(80) DEFAULT 'India',
    pincode         VARCHAR(20),
    phone           VARCHAR(30),
    email           VARCHAR(120),
    website         VARCHAR(200),
    lab_type        VARCHAR(60),
    accreditation   VARCHAR(60),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    setup_complete  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organisations(id);

CREATE TABLE system_config (
    key    VARCHAR(60) PRIMARY KEY,
    value  TEXT NOT NULL
);

-- IMPORTANT: If any ADMIN user already exists (seeded via V2/V3),
-- mark setup as done so existing deployments skip the registration wizard.
-- For brand new deployments with no users, this inserts 'false'.
INSERT INTO system_config(key, value)
SELECT 'setup_done',
       CASE WHEN EXISTS (
           SELECT 1 FROM users WHERE role = 'ADMIN' AND is_active = TRUE
       ) THEN 'true' ELSE 'false' END;
