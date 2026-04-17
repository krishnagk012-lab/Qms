-- V9: Facilities & Environmental Conditions — ISO 17025:2017 Clause 6.3

-- ── Cl. 6.3.2 — Facility rooms / areas ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS facilities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id     VARCHAR(20) UNIQUE NOT NULL,   -- e.g. FAC-LAB-01
    name            VARCHAR(150) NOT NULL,          -- e.g. Chemistry Laboratory
    facility_type   VARCHAR(30) NOT NULL,           -- LAB | STORAGE | OFFICE | EXTERNAL | UTILITY
    location        VARCHAR(100),                   -- Floor/wing/address
    area_sqm        NUMERIC(8,2),                   -- Area in sq. metres

    -- Cl. 6.3.2 — Documented requirements
    activities_performed TEXT,                      -- What laboratory activities happen here
    documented_requirements TEXT,                   -- Environmental requirements per Cl. 6.3.2

    -- Cl. 6.3.3 — Environmental parameters to monitor
    monitor_temperature  BOOLEAN DEFAULT FALSE,
    monitor_humidity     BOOLEAN DEFAULT FALSE,
    monitor_pressure     BOOLEAN DEFAULT FALSE,
    monitor_co2          BOOLEAN DEFAULT FALSE,
    monitor_particulates BOOLEAN DEFAULT FALSE,
    monitor_vibration    BOOLEAN DEFAULT FALSE,
    monitor_lighting     BOOLEAN DEFAULT FALSE,
    monitor_other        VARCHAR(200),

    -- Cl. 6.3.3 — Acceptable limits
    temp_min     NUMERIC(6,2),
    temp_max     NUMERIC(6,2),
    temp_unit    VARCHAR(5) DEFAULT '°C',
    humidity_min NUMERIC(6,2),
    humidity_max NUMERIC(6,2),

    -- Cl. 6.3.4 — Access control
    access_control      VARCHAR(30),   -- OPEN | RESTRICTED | CONTROLLED | SECURED
    access_requirements TEXT,          -- Who is allowed, how access is managed

    -- Cl. 6.3.4(b) — Contamination prevention
    contamination_controls TEXT,

    -- Cl. 6.3.4(c) — Separation from incompatible areas
    separation_measures TEXT,
    incompatible_areas  VARCHAR(200),  -- Areas that must be separated from this one

    -- Cl. 6.3.5 — External site
    is_external_site    BOOLEAN DEFAULT FALSE,
    external_site_address VARCHAR(300),
    external_compliance_notes TEXT,

    status              VARCHAR(20) DEFAULT 'ACTIVE',  -- ACTIVE | UNDER_MAINTENANCE | DECOMMISSIONED
    responsible_person  VARCHAR(120),
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── Cl. 6.3.3 — Environmental monitoring log ────────────────────────────────
CREATE TABLE IF NOT EXISTS env_readings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id     VARCHAR(20) NOT NULL REFERENCES facilities(facility_id) ON DELETE CASCADE,
    recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recorded_by     VARCHAR(120),
    temperature     NUMERIC(6,2),
    humidity        NUMERIC(6,2),
    pressure        NUMERIC(8,2),
    co2_ppm         NUMERIC(8,2),
    particulates    NUMERIC(8,2),
    vibration       NUMERIC(8,2),
    lighting_lux    NUMERIC(8,2),
    other_value     NUMERIC(8,2),
    other_label     VARCHAR(60),
    within_limits   BOOLEAN DEFAULT TRUE,
    deviation_notes TEXT,     -- if outside limits, what action was taken
    ncr_reference   VARCHAR(30)
);

CREATE INDEX IF NOT EXISTS idx_env_readings_facility ON env_readings(facility_id);
CREATE INDEX IF NOT EXISTS idx_env_readings_time     ON env_readings(recorded_at DESC);
