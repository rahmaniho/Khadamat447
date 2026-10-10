-- =====================================================================
-- دفتر خدمات سلامت ۴۷۷ - طرح پایگاه داده
-- این فایل هم با SQLite و هم با PostgreSQL سازگار است:
--   * کلیدهای اصلی به‌صورت TEXT و توسط برنامه تولید می‌شوند (UUID)
--   * مقدارهای بولین به‌صورت INTEGER (۰/۱) ذخیره می‌شوند
--   * تاریخ‌ها به‌صورت TEXT در قالب ISO-8601 (UTC) ذخیره می‌شوند
--   * ساختارهای JSON به‌صورت TEXT ذخیره می‌شوند
-- =====================================================================

CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS services (
  id               TEXT PRIMARY KEY,
  slug             TEXT NOT NULL UNIQUE,
  title            TEXT NOT NULL,
  tagline          TEXT NOT NULL DEFAULT '',
  summary          TEXT NOT NULL DEFAULT '',
  intro_md         TEXT NOT NULL DEFAULT '',
  audience_md      TEXT NOT NULL DEFAULT '',
  process_md       TEXT NOT NULL DEFAULT '',
  documents_md     TEXT NOT NULL DEFAULT '',
  seo_title        TEXT NOT NULL DEFAULT '',
  seo_description  TEXT NOT NULL DEFAULT '',
  icon             TEXT NOT NULL DEFAULT 'shield',
  featured         INTEGER NOT NULL DEFAULT 1,
  active           INTEGER NOT NULL DEFAULT 1,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  allow_attachments INTEGER NOT NULL DEFAULT 1,
  max_attachments  INTEGER NOT NULL DEFAULT 4,
  reviewed_at      TEXT,
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS service_fields (
  id            TEXT PRIMARY KEY,
  service_id    TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  field_key     TEXT NOT NULL,
  label         TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'text',
  options_json  TEXT NOT NULL DEFAULT '[]',
  placeholder   TEXT NOT NULL DEFAULT '',
  help_text     TEXT NOT NULL DEFAULT '',
  required      INTEGER NOT NULL DEFAULT 0,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  active        INTEGER NOT NULL DEFAULT 1
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_service_fields_key ON service_fields(service_id, field_key);

CREATE TABLE IF NOT EXISTS requests (
  id                   TEXT PRIMARY KEY,
  tracking_code        TEXT NOT NULL UNIQUE,
  client_submission_id TEXT UNIQUE,
  service_id           TEXT REFERENCES services(id) ON DELETE SET NULL,
  service_slug         TEXT NOT NULL DEFAULT '',
  service_title        TEXT NOT NULL DEFAULT '',
  requester_type       TEXT NOT NULL DEFAULT 'person',
  full_name            TEXT NOT NULL,
  phone                TEXT NOT NULL,
  phone_last4          TEXT NOT NULL DEFAULT '',
  email                TEXT NOT NULL DEFAULT '',
  city                 TEXT NOT NULL DEFAULT '',
  org_name             TEXT NOT NULL DEFAULT '',
  preferred_contact    TEXT NOT NULL DEFAULT 'phone',
  message              TEXT NOT NULL DEFAULT '',
  status               TEXT NOT NULL DEFAULT 'new',
  public_note          TEXT NOT NULL DEFAULT '',
  internal_note        TEXT NOT NULL DEFAULT '',
  consent_privacy_at   TEXT,
  consent_marketing    INTEGER NOT NULL DEFAULT 0,
  source               TEXT NOT NULL DEFAULT 'website',
  ip_hash              TEXT NOT NULL DEFAULT '',
  user_agent           TEXT NOT NULL DEFAULT '',
  notification_state   TEXT NOT NULL DEFAULT 'pending',
  archived             INTEGER NOT NULL DEFAULT 0,
  created_at           TEXT NOT NULL,
  updated_at           TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS ix_requests_service ON requests(service_id);
CREATE INDEX IF NOT EXISTS ix_requests_created ON requests(created_at);
CREATE INDEX IF NOT EXISTS ix_requests_phone_last4 ON requests(phone_last4);

CREATE TABLE IF NOT EXISTS request_fields (
  id         TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  field_key  TEXT NOT NULL,
  label      TEXT NOT NULL DEFAULT '',
  value      TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS ix_request_fields_request ON request_fields(request_id);

CREATE TABLE IF NOT EXISTS request_status_history (
  id          TEXT PRIMARY KEY,
  request_id  TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  from_status TEXT NOT NULL DEFAULT '',
  to_status   TEXT NOT NULL DEFAULT '',
  note        TEXT NOT NULL DEFAULT '',
  actor_id    TEXT NOT NULL DEFAULT '',
  actor_name  TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_history_request ON request_status_history(request_id);

CREATE TABLE IF NOT EXISTS attachments (
  id            TEXT PRIMARY KEY,
  request_id    TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  original_name TEXT NOT NULL,
  stored_name   TEXT NOT NULL,
  mime_type     TEXT NOT NULL DEFAULT '',
  size_bytes    INTEGER NOT NULL DEFAULT 0,
  sha256        TEXT NOT NULL DEFAULT '',
  note          TEXT NOT NULL DEFAULT '',
  uploaded_at   TEXT NOT NULL,
  deleted_at    TEXT,
  deleted_by    TEXT
);
CREATE INDEX IF NOT EXISTS ix_attachments_request ON attachments(request_id);

CREATE TABLE IF NOT EXISTS attachment_access_logs (
  id            TEXT PRIMARY KEY,
  attachment_id TEXT NOT NULL,
  request_id    TEXT NOT NULL DEFAULT '',
  actor_id      TEXT NOT NULL DEFAULT '',
  actor_role    TEXT NOT NULL DEFAULT '',
  action        TEXT NOT NULL DEFAULT 'view',
  ip            TEXT NOT NULL DEFAULT '',
  created_at    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_attach_logs_attachment ON attachment_access_logs(attachment_id);

CREATE TABLE IF NOT EXISTS faqs (
  id         TEXT PRIMARY KEY,
  service_id TEXT REFERENCES services(id) ON DELETE CASCADE,
  question   TEXT NOT NULL,
  answer_md  TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  published  INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_faqs_service ON faqs(service_id);

CREATE TABLE IF NOT EXISTS articles (
  id               TEXT PRIMARY KEY,
  slug             TEXT NOT NULL UNIQUE,
  title            TEXT NOT NULL,
  excerpt          TEXT NOT NULL DEFAULT '',
  body_md          TEXT NOT NULL DEFAULT '',
  cover_path       TEXT NOT NULL DEFAULT '',
  author           TEXT NOT NULL DEFAULT '',
  category         TEXT NOT NULL DEFAULT '',
  status           TEXT NOT NULL DEFAULT 'draft',
  related_services TEXT NOT NULL DEFAULT '[]',
  seo_title        TEXT NOT NULL DEFAULT '',
  seo_description  TEXT NOT NULL DEFAULT '',
  review_note      TEXT NOT NULL DEFAULT '',
  published_at     TEXT,
  updated_at       TEXT NOT NULL,
  created_at       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id                   TEXT PRIMARY KEY,
  name                 TEXT NOT NULL,
  email                TEXT NOT NULL UNIQUE,
  password_hash        TEXT NOT NULL,
  role                 TEXT NOT NULL DEFAULT 'reviewer',
  active               INTEGER NOT NULL DEFAULT 1,
  must_change_password INTEGER NOT NULL DEFAULT 0,
  failed_attempts      INTEGER NOT NULL DEFAULT 0,
  locked_until         TEXT,
  last_login_at        TEXT,
  created_at           TEXT NOT NULL,
  updated_at           TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  user_agent TEXT NOT NULL DEFAULT '',
  ip         TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS ix_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS notifications (
  id              TEXT PRIMARY KEY,
  request_id      TEXT NOT NULL DEFAULT '',
  kind            TEXT NOT NULL DEFAULT '',
  channel         TEXT NOT NULL DEFAULT 'email',
  recipient       TEXT NOT NULL DEFAULT '',
  subject         TEXT NOT NULL DEFAULT '',
  body            TEXT NOT NULL DEFAULT '',
  status          TEXT NOT NULL DEFAULT 'pending',
  attempts        INTEGER NOT NULL DEFAULT 0,
  last_error      TEXT NOT NULL DEFAULT '',
  dedupe_key      TEXT,
  created_at      TEXT NOT NULL,
  sent_at         TEXT,
  next_attempt_at TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_notifications_dedupe ON notifications(dedupe_key);
CREATE INDEX IF NOT EXISTS ix_notifications_status ON notifications(status);

CREATE TABLE IF NOT EXISTS audit_logs (
  id          TEXT PRIMARY KEY,
  actor_id    TEXT NOT NULL DEFAULT '',
  actor_name  TEXT NOT NULL DEFAULT '',
  actor_role  TEXT NOT NULL DEFAULT '',
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL DEFAULT '',
  entity_id   TEXT NOT NULL DEFAULT '',
  meta_json   TEXT NOT NULL DEFAULT '{}',
  ip          TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_audit_created ON audit_logs(created_at);

CREATE TABLE IF NOT EXISTS login_attempts (
  id         TEXT PRIMARY KEY,
  identifier TEXT NOT NULL DEFAULT '',
  ip         TEXT NOT NULL DEFAULT '',
  success    INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_login_attempts_ip ON login_attempts(ip, created_at);

CREATE TABLE IF NOT EXISTS announcements (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  body_md    TEXT NOT NULL DEFAULT '',
  kind       TEXT NOT NULL DEFAULT 'info',
  active     INTEGER NOT NULL DEFAULT 1,
  starts_at  TEXT,
  ends_at    TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS request_notes (
  id          TEXT PRIMARY KEY,
  request_id  TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  author_id   TEXT NOT NULL DEFAULT '',
  author_name TEXT NOT NULL DEFAULT '',
  body        TEXT NOT NULL,
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_request_notes_request ON request_notes(request_id);
