-- QMS Suite — Seed data (V2)
-- Default admin user password: Admin@123  (BCrypt hashed)

-- All users login with password: Admin@123
-- Users are created via the registration wizard (first admin) and Users panel.
-- No seed users inserted - fresh install requires registration.

-- Documents
INSERT INTO documents (doc_id, title, category, version, status, issue_date, review_due, owner) VALUES
  ('SOP-TEST-001', 'Sample Preparation Procedure',        'Testing',     'v3.1', 'ACTIVE',        CURRENT_DATE - 350, CURRENT_DATE + 15,  'Ravi Kumar'),
  ('SOP-TEST-002', 'Instrument Calibration Procedure',    'Calibration', 'v2.4', 'ACTIVE',        CURRENT_DATE - 300, CURRENT_DATE + 65,  'Priya Nair'),
  ('SOP-TEST-003', 'Environmental Monitoring SOP',        'Facilities',  'v1.2', 'UNDER_REVIEW',  CURRENT_DATE - 420, CURRENT_DATE - 55,  'Arjun Singh'),
  ('SOP-TEST-004', 'Measurement Uncertainty Procedure',   'Technical',   'v2.0', 'ACTIVE',        CURRENT_DATE - 320, CURRENT_DATE + 45,  'Ravi Kumar'),
  ('POL-QMS-001',  'Quality Policy',                     'Quality',     'v4.0', 'ACTIVE',        CURRENT_DATE - 200, CURRENT_DATE + 165, 'Mohan Das'),
  ('POL-QMS-002',  'Impartiality Policy',                'Quality',     'v2.1', 'ACTIVE',        CURRENT_DATE - 200, CURRENT_DATE + 165, 'Mohan Das'),
  ('WI-CAL-001',   'Balance Calibration Work Instruction','Calibration', 'v1.5', 'ACTIVE',        CURRENT_DATE - 270, CURRENT_DATE + 95,  'Priya Nair'),
  ('FORM-001',     'Non-Conformance Report Form',         'Quality',     'v3.0', 'ACTIVE',        CURRENT_DATE - 365, CURRENT_DATE,       'Ravi Kumar'),
  ('FORM-002',     'Internal Audit Checklist',            'Audit',       'v2.2', 'ACTIVE',        CURRENT_DATE - 180, CURRENT_DATE + 185, 'Arjun Singh'),
  ('WI-CAL-002',   'Pipette Calibration Work Instruction','Calibration', 'v1.0', 'DRAFT',         CURRENT_DATE - 120, CURRENT_DATE + 245, 'Priya Nair');

-- Equipment
INSERT INTO equipment (eq_id, name, make, model, location, status, last_cal, next_cal, cal_frequency, cal_source) VALUES
  ('EQ-001', 'Analytical Balance',        'Mettler Toledo', 'MS204S',   'LAB-01', 'CALIBRATED',     CURRENT_DATE - 90,  CURRENT_DATE + 90,  '6 months',  'NABL Lab'),
  ('EQ-002', 'Vernier Caliper',           'Mitutoyo',       '530-312',  'LAB-01', 'OVERDUE',        CURRENT_DATE - 210, CURRENT_DATE - 30,  '6 months',  'In-house'),
  ('EQ-003', 'Digital Thermometer',       'Fluke',          '1521',     'ENV-01', 'CALIBRATED',     CURRENT_DATE - 45,  CURRENT_DATE + 320, '12 months', 'NABL Lab'),
  ('EQ-004', 'Pipette Set (10-100 uL)',   'Eppendorf',      'Research+','LAB-02', 'DUE_SOON',       CURRENT_DATE - 160, CURRENT_DATE + 20,  '6 months',  'In-house'),
  ('EQ-005', 'pH Meter',                  'Hanna Inst.',    'HI2020',   'LAB-02', 'CALIBRATED',     CURRENT_DATE - 30,  CURRENT_DATE + 150, '6 months',  'In-house'),
  ('EQ-006', 'Digital Balance (2 kg)',    'Ohaus',          'Pioneer',  'LAB-01', 'DUE_SOON',       CURRENT_DATE - 175, CURRENT_DATE + 5,   '6 months',  'NABL Lab'),
  ('EQ-007', 'Conductivity Meter',        'Thermo Fisher',  'Orion',    'ENV-01', 'CALIBRATED',     CURRENT_DATE - 10,  CURRENT_DATE + 170, '6 months',  'In-house'),
  ('EQ-008', 'Sound Level Meter',         'Bruel & Kjaer',  '2250',     'ENV-02', 'OUT_OF_SERVICE', CURRENT_DATE - 580, CURRENT_DATE - 215, '12 months', 'NABL Lab'),
  ('EQ-009', 'Turbidity Meter',           'HACH',           '2100Q',    'LAB-02', 'CALIBRATED',     CURRENT_DATE - 56,  CURRENT_DATE + 309, '12 months', 'NABL Lab'),
  ('EQ-010', 'Spectrophotometer',         'Shimadzu',       'UV-1900',  'LAB-03', 'DUE_SOON',       CURRENT_DATE - 168, CURRENT_DATE + 12,  '6 months',  'NABL Lab');

-- Personnel
INSERT INTO personnel (emp_id, full_name, designation, department, qualification, joined_date, status) VALUES
  ('EMP-001', 'Ravi Kumar',      'Senior Analyst',       'Testing',     'M.Sc Chemistry',        CURRENT_DATE - 2100, 'ACTIVE'),
  ('EMP-002', 'Priya Nair',      'Calibration Engineer', 'Calibration', 'B.E. Instrumentation',  CURRENT_DATE - 1600, 'ACTIVE'),
  ('EMP-003', 'Arjun Singh',     'Quality Officer',      'Quality',     'M.Sc Microbiology',     CURRENT_DATE - 1460, 'ACTIVE'),
  ('EMP-004', 'Deepa Menon',     'Lab Technician',       'Testing',     'B.Sc Chemistry',        CURRENT_DATE - 970,  'ACTIVE'),
  ('EMP-005', 'Suresh Babu',     'Equipment Manager',    'Calibration', 'Diploma EIE',           CURRENT_DATE - 2400, 'ACTIVE'),
  ('EMP-006', 'Kavitha Reddy',   'Junior Analyst',       'Testing',     'B.Sc Biochemistry',     CURRENT_DATE - 510,  'ACTIVE'),
  ('EMP-007', 'Mohan Das',       'Lab Manager',          'Management',  'M.Tech Chem Engg',      CURRENT_DATE - 3800, 'ACTIVE'),
  ('EMP-008', 'Anitha Krishnan', 'Audit Coordinator',    'Quality',     'M.Sc Environmental',    CURRENT_DATE - 1680, 'ON_LEAVE');

-- NCRs
INSERT INTO ncrs (ncr_id, finding, area, severity, status, raised_date, assignee, due_date) VALUES
  ('NCR-2025-001', 'Calibration record missing for Balance #EQ-002',      'Calibration', 'MAJOR', 'OPEN',        CURRENT_DATE - 5,  'Priya Nair',  CURRENT_DATE + 25),
  ('NCR-2025-002', 'SOP-TEST-003 review cycle overdue by 55 days',        'Documents',   'MINOR', 'IN_PROGRESS', CURRENT_DATE - 8,  'Arjun Singh', CURRENT_DATE + 22),
  ('NCR-2025-003', 'PT results not recorded within required 7-day window', 'Testing',    'MINOR', 'CLOSED',      CURRENT_DATE - 11, 'Ravi Kumar',  CURRENT_DATE - 3),
  ('NCR-2025-004', 'Equipment EQ-008 used past calibration expiry',       'Calibration', 'MAJOR', 'IN_PROGRESS', CURRENT_DATE - 25, 'Priya Nair',  CURRENT_DATE + 5);

-- PT Schemes
INSERT INTO pt_schemes (scheme_id, scheme_name, provider, parameter, frequency, status, next_round) VALUES
  ('PT-001', 'NABL PT - Water Chemistry', 'NABL/EPTRI', 'pH, TDS, Hardness', 'Bi-annual', 'ACTIVE', CURRENT_DATE + 45),
  ('PT-002', 'NABL PT - Heavy Metals',    'NABL/CSIR',  'Pb, Cd, As, Hg',   'Annual',    'ACTIVE', CURRENT_DATE + 120),
  ('PT-003', 'FAPAS - Food Contaminants', 'FAPAS UK',   'Pesticide residues','Annual',    'ACTIVE', CURRENT_DATE + 200),
  ('PT-004', 'NABL PT - Microbiological', 'NABL/NICD',  'Total Coliform',   'Bi-annual', 'ACTIVE', CURRENT_DATE + 60);

-- Risks
INSERT INTO risks (risk_id, description, area, likelihood, impact, level, treatment, status, control_measure) VALUES
  ('RSK-001', 'Loss of key qualified analyst',       'Personnel',   4, 4, 'HIGH',   'MITIGATE', 'OPEN',   'Cross-train 2 backup analysts'),
  ('RSK-002', 'Calibration lab unavailability',      'Calibration', 3, 4, 'HIGH',   'MITIGATE', 'OPEN',   'Alternate NABL lab identified'),
  ('RSK-003', 'Power failure during testing',        'Facilities',  2, 3, 'MEDIUM', 'ACCEPT',   'OPEN',   'UPS installed for critical equipment'),
  ('RSK-004', 'Reference standard traceability gap', 'Technical',   3, 5, 'HIGH',   'MITIGATE', 'OPEN',   'Annual recalibration programme established'),
  ('RSK-005', 'Document control version conflict',   'Documents',   2, 2, 'LOW',    'ACCEPT',   'CLOSED', 'DMS enforces single approved version');

-- Audits
INSERT INTO audits (audit_id, scope, start_date, end_date, lead_auditor, status, score, ncr_count) VALUES
  ('AUD-2025-001', 'Internal Audit — Testing Laboratory', CURRENT_DATE - 10, CURRENT_DATE - 9, 'Arjun Singh', 'COMPLETED', '94%', 2),
  ('AUD-2025-002', 'Internal Audit — Calibration',        CURRENT_DATE + 32, CURRENT_DATE + 33,'Arjun Singh', 'SCHEDULED',  NULL, 0),
  ('AUD-2024-004', 'Internal Audit — Quality System',     CURRENT_DATE - 90, CURRENT_DATE - 89,'Arjun Singh', 'COMPLETED', '88%', 5);
