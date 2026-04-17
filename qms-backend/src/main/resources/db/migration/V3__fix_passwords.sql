-- V3: Fix password hashes (V2 had placeholder hashes that matched no password)
UPDATE users SET password_hash = '$2b$10$5VtTKd0cwE5eNU8TkxeC9O0L2Bc5frcaPE4EedV.ZBZCwcx.21k9W' WHERE username = 'admin';
UPDATE users SET password_hash = '$2b$10$okJepmBxZ.ZflQUwiNc3EuBgfzyUongL9ak969H7835WtQKOUlKoK' WHERE username = 'ravi';
UPDATE users SET password_hash = '$2b$10$tm45/sIyJIasJIqeXtskfeTMsJq/Fndht702w4uXaPn0ZNTUxV3pK' WHERE username = 'priya';
UPDATE users SET password_hash = '$2b$10$yZyxsMoZSiagJqiJw42UGuj6LL1tQmP1.7XquHoPdASgtSYsQEgUq' WHERE username = 'arjun';
UPDATE users SET password_hash = '$2b$10$FkSxBGpj8v/0.7ZRuok6GOURB9q.2bmqbhOTaOATSnC.3988mbnyS' WHERE username = 'mohan';
