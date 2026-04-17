-- ── V4: Fix schema issues that cause 500 errors ───────────────────────────────

-- 1. training_records: add updated_at
ALTER TABLE training_records 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 2. pt_results: drop the NOT NULL + FK on scheme_id (no pt_schemes seed data),
--    add updated_at
ALTER TABLE pt_results 
  DROP CONSTRAINT IF EXISTS pt_results_scheme_id_fkey;
ALTER TABLE pt_results 
  ALTER COLUMN scheme_id DROP NOT NULL;
ALTER TABLE pt_results 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 3. audits: add updated_at
ALTER TABLE audits 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 4. calibration_log: add updated_at
ALTER TABLE calibration_log 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 5. uncertainty_sources: add updated_at  
ALTER TABLE uncertainty_sources 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 6. pt_schemes: add updated_at
ALTER TABLE pt_schemes 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 7. audit_trail: add updated_at (nullable since it's a log table)
ALTER TABLE audit_trail 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

