-- Run this in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS employees (
  id                     TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name                   TEXT NOT NULL,
  position               TEXT,
  department             TEXT,
  join_date              DATE NOT NULL,
  is_active              BOOLEAN NOT NULL DEFAULT TRUE,
  meal_allowance         INTEGER NOT NULL DEFAULT 40000,
  normal_check_in        TEXT NOT NULL DEFAULT '08:00',
  late_tolerance_minutes INTEGER NOT NULL DEFAULT 15,
  work_days              TEXT[] NOT NULL DEFAULT ARRAY['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY'],
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendances (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  check_in    TEXT,
  check_out   TEXT,
  status      TEXT NOT NULL,
  is_late     BOOLEAN NOT NULL DEFAULT FALSE,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

CREATE TABLE IF NOT EXISTS app_settings (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  key        TEXT NOT NULL UNIQUE,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS employees_updated_at ON employees;
CREATE TRIGGER employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS attendances_updated_at ON attendances;
CREATE TRIGGER attendances_updated_at
  BEFORE UPDATE ON attendances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS app_settings_updated_at ON app_settings;
CREATE TRIGGER app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
