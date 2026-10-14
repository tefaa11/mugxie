CREATE TABLE IF NOT EXISTS resources (
  name TEXT PRIMARY KEY,
  value TEXT NOT NULL CHECK(json_valid(value)),
  revision INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, expires INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires);
CREATE TABLE IF NOT EXISTS login_attempts (key TEXT PRIMARY KEY, window_start INTEGER NOT NULL, count INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS attempts_expiry ON login_attempts(window_start);
