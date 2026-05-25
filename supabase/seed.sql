-- Run after schema.sql
-- Inserts initial app settings and sample employees

INSERT INTO app_settings (key, value) VALUES
  ('normalCheckIn',        '08:00'),
  ('lateToleranceMinutes', '15'),
  ('defaultMealAllowance', '40000'),
  ('companyName',          'HR Admin Tool'),
  ('deductOnAlpha',        'true')
ON CONFLICT (key) DO NOTHING;

INSERT INTO employees (id, name, position, department, join_date, meal_allowance) VALUES
  ('safitri',  'Safitri',  'Staff', 'Operasional',  '2024-01-15', 40000),
  ('michelle', 'Michelle', 'Staff', 'Operasional',  '2024-02-01', 40000),
  ('tania',    'Tania',    'Staff', 'Operasional',  '2024-02-01', 40000),
  ('clarita',  'Clarita',  'Staff', 'Operasional',  '2024-03-01', 40000),
  ('firman',   'Firman',   'Staff', 'Operasional',  '2024-03-01', 30000),
  ('damar',    'Damar',    'Staff', 'Operasional',  '2024-03-15', 30000),
  ('sarah',    'Sarah',    'Staff', 'Administrasi', '2024-04-01', 30000),
  ('vika',     'Vika',     'Staff', 'Administrasi', '2024-04-01', 30000)
ON CONFLICT (id) DO NOTHING;
