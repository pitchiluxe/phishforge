-- ============================================================
-- PhishForge AI — Initial Schema
-- Version: 001
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─── ENUMS ────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('owner', 'admin', 'manager', 'analyst', 'viewer');
CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'running', 'completed', 'paused', 'cancelled');
CREATE TYPE simulation_type AS ENUM ('email', 'sms', 'voice', 'landing_page', 'attachment');
CREATE TYPE ai_provider AS ENUM ('openrouter', 'ollama');
CREATE TYPE document_status AS ENUM ('uploading', 'processing', 'indexed', 'failed');
CREATE TYPE webhook_event AS ENUM ('sent', 'delivered', 'opened', 'clicked', 'submitted', 'reported');
CREATE TYPE threat_severity AS ENUM ('critical', 'high', 'medium', 'low', 'info');

-- ─── ORGANIZATIONS (Tenants) ──────────────────────────────────

CREATE TABLE organizations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  domain          TEXT,
  logo_url        TEXT,
  plan            subscription_plan NOT NULL DEFAULT 'free',
  plan_expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  monthly_simulation_limit INTEGER NOT NULL DEFAULT 100,
  simulations_used_this_month INTEGER NOT NULL DEFAULT 0,
  ai_provider     ai_provider NOT NULL DEFAULT 'openrouter',
  ai_model        TEXT,
  ollama_base_url TEXT,
  openrouter_model TEXT DEFAULT 'deepseek/deepseek-chat-v3-0324',
  webhook_url     TEXT,
  webhook_secret  TEXT DEFAULT encode(gen_random_bytes(32), 'hex'),
  settings        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_stripe_customer ON organizations(stripe_customer_id);

-- ─── USERS ────────────────────────────────────────────────────

CREATE TABLE users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email           TEXT NOT NULL UNIQUE,
  full_name       TEXT,
  avatar_url      TEXT,
  role            user_role NOT NULL DEFAULT 'viewer',
  mfa_enabled     BOOLEAN NOT NULL DEFAULT FALSE,
  last_sign_in_at TIMESTAMPTZ,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);

-- ─── CAMPAIGNS ────────────────────────────────────────────────

CREATE TABLE campaigns (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by      UUID NOT NULL REFERENCES users(id),
  name            TEXT NOT NULL,
  description     TEXT,
  status          campaign_status NOT NULL DEFAULT 'draft',
  simulation_type simulation_type NOT NULL DEFAULT 'email',
  industry        TEXT NOT NULL DEFAULT 'technology',
  target_role     TEXT NOT NULL DEFAULT 'employee',
  difficulty      INTEGER NOT NULL DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),
  scheduled_at    TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  ai_provider     ai_provider,
  ai_model        TEXT,
  ai_prompt       TEXT,
  settings        JSONB NOT NULL DEFAULT '{}',
  stats           JSONB NOT NULL DEFAULT '{
    "total_targets": 0,
    "sent": 0,
    "delivered": 0,
    "opened": 0,
    "clicked": 0,
    "submitted": 0,
    "reported": 0
  }',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campaigns_organization ON campaigns(organization_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_created_by ON campaigns(created_by);

-- ─── SIMULATION TEMPLATES ─────────────────────────────────────

CREATE TABLE templates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id     UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  simulation_type simulation_type NOT NULL DEFAULT 'email',
  industry        TEXT,
  target_role     TEXT,
  difficulty      INTEGER DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),
  subject         TEXT,
  body_html       TEXT,
  body_text       TEXT,
  sender_name     TEXT,
  sender_email    TEXT,
  landing_page_html TEXT,
  attachment_type TEXT,
  tags            TEXT[] DEFAULT '{}',
  is_public       BOOLEAN NOT NULL DEFAULT FALSE,
  safety_score    INTEGER CHECK (safety_score BETWEEN 0 AND 100),
  ai_generated    BOOLEAN NOT NULL DEFAULT FALSE,
  generation_meta JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_templates_organization ON templates(organization_id);
CREATE INDEX idx_templates_public ON templates(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_templates_tags ON templates USING GIN(tags);

-- ─── CAMPAIGN TARGETS ─────────────────────────────────────────

CREATE TABLE campaign_targets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  full_name       TEXT,
  department      TEXT,
  role            TEXT,
  tracking_token  TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  events          JSONB NOT NULL DEFAULT '[]',
  risk_score      INTEGER DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_targets_campaign ON campaign_targets(campaign_id);
CREATE INDEX idx_targets_organization ON campaign_targets(organization_id);
CREATE INDEX idx_targets_token ON campaign_targets(tracking_token);

-- ─── TRACKING EVENTS ──────────────────────────────────────────

CREATE TABLE tracking_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_id       UUID NOT NULL REFERENCES campaign_targets(id) ON DELETE CASCADE,
  campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_type      webhook_event NOT NULL,
  ip_address      INET,
  user_agent      TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_target ON tracking_events(target_id);
CREATE INDEX idx_events_campaign ON tracking_events(campaign_id);
CREATE INDEX idx_events_organization ON tracking_events(organization_id);
CREATE INDEX idx_events_type ON tracking_events(event_type);
CREATE INDEX idx_events_created_at ON tracking_events(created_at);

-- ─── KNOWLEDGE BASE (Documents for RAG) ──────────────────────

CREATE TABLE knowledge_documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  uploaded_by     UUID NOT NULL REFERENCES users(id),
  name            TEXT NOT NULL,
  file_type       TEXT NOT NULL,
  file_size       INTEGER,
  storage_path    TEXT,
  status          document_status NOT NULL DEFAULT 'uploading',
  chunk_count     INTEGER DEFAULT 0,
  pinecone_namespace TEXT,
  error_message   TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_organization ON knowledge_documents(organization_id);
CREATE INDEX idx_documents_status ON knowledge_documents(status);

-- ─── THREAT INTELLIGENCE ──────────────────────────────────────

CREATE TABLE threat_intelligence (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  description     TEXT,
  severity        threat_severity NOT NULL DEFAULT 'medium',
  category        TEXT NOT NULL,
  industries      TEXT[] DEFAULT '{}',
  iocs            JSONB DEFAULT '[]',
  ttps            JSONB DEFAULT '[]',
  source_url      TEXT,
  published_at    TIMESTAMPTZ,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_threats_severity ON threat_intelligence(severity);
CREATE INDEX idx_threats_industries ON threat_intelligence USING GIN(industries);
CREATE INDEX idx_threats_active ON threat_intelligence(is_active) WHERE is_active = TRUE;

-- ─── AUDIT LOGS ───────────────────────────────────────────────

CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  action          TEXT NOT NULL,
  resource_type   TEXT NOT NULL,
  resource_id     UUID,
  ip_address      INET,
  user_agent      TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_organization ON audit_logs(organization_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- ─── AI GENERATION LOGS ───────────────────────────────────────

CREATE TABLE ai_generation_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  campaign_id     UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  provider        ai_provider NOT NULL,
  model           TEXT NOT NULL,
  prompt_tokens   INTEGER,
  completion_tokens INTEGER,
  total_tokens    INTEGER,
  latency_ms      INTEGER,
  success         BOOLEAN NOT NULL DEFAULT TRUE,
  error_message   TEXT,
  safety_score    INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_logs_organization ON ai_generation_logs(organization_id);
CREATE INDEX idx_ai_logs_created_at ON ai_generation_logs(created_at);

-- ─── UPDATED_AT TRIGGERS ──────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON knowledge_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get the current user's organization_id
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM users WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function to get the current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM users WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Organizations: members can read their own org
CREATE POLICY "org_select" ON organizations FOR SELECT
  USING (id = get_user_org_id());

CREATE POLICY "org_update_admin" ON organizations FOR UPDATE
  USING (id = get_user_org_id() AND get_user_role() IN ('owner', 'admin'));

-- Users: members can see others in same org
CREATE POLICY "users_select_org" ON users FOR SELECT
  USING (organization_id = get_user_org_id());

CREATE POLICY "users_update_self" ON users FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "users_update_admin" ON users FOR UPDATE
  USING (organization_id = get_user_org_id() AND get_user_role() IN ('owner', 'admin'));

-- Campaigns: org-scoped
CREATE POLICY "campaigns_select" ON campaigns FOR SELECT
  USING (organization_id = get_user_org_id());

CREATE POLICY "campaigns_insert" ON campaigns FOR INSERT
  WITH CHECK (organization_id = get_user_org_id() AND get_user_role() IN ('owner', 'admin', 'manager'));

CREATE POLICY "campaigns_update" ON campaigns FOR UPDATE
  USING (organization_id = get_user_org_id() AND get_user_role() IN ('owner', 'admin', 'manager'));

CREATE POLICY "campaigns_delete" ON campaigns FOR DELETE
  USING (organization_id = get_user_org_id() AND get_user_role() IN ('owner', 'admin'));

-- Templates: org-scoped + public templates
CREATE POLICY "templates_select" ON templates FOR SELECT
  USING (organization_id = get_user_org_id() OR is_public = TRUE);

CREATE POLICY "templates_insert" ON templates FOR INSERT
  WITH CHECK (organization_id = get_user_org_id());

CREATE POLICY "templates_update" ON templates FOR UPDATE
  USING (organization_id = get_user_org_id());

-- Knowledge documents: org-scoped
CREATE POLICY "documents_select" ON knowledge_documents FOR SELECT
  USING (organization_id = get_user_org_id());

CREATE POLICY "documents_insert" ON knowledge_documents FOR INSERT
  WITH CHECK (organization_id = get_user_org_id());

CREATE POLICY "documents_update" ON knowledge_documents FOR UPDATE
  USING (organization_id = get_user_org_id());

CREATE POLICY "documents_delete" ON knowledge_documents FOR DELETE
  USING (organization_id = get_user_org_id() AND get_user_role() IN ('owner', 'admin', 'manager'));

-- Audit logs: org-scoped, read-only for non-admins
CREATE POLICY "audit_select" ON audit_logs FOR SELECT
  USING (organization_id = get_user_org_id() AND get_user_role() IN ('owner', 'admin', 'manager'));

-- AI logs: org-scoped
CREATE POLICY "ai_logs_select" ON ai_generation_logs FOR SELECT
  USING (organization_id = get_user_org_id());

-- ─── SEED DATA ────────────────────────────────────────────────

-- Public phishing templates (industry-standard scenarios)
INSERT INTO templates (id, name, description, simulation_type, industry, target_role, difficulty, subject, body_html, body_text, sender_name, sender_email, tags, is_public, safety_score) VALUES
(
  uuid_generate_v4(),
  'IT Password Reset',
  'Classic IT helpdesk credential phishing scenario',
  'email', 'technology', 'employee', 2,
  'Action Required: Reset Your Password Within 24 Hours',
  '<html><body><p>Dear {{employee_name}},</p><p>Our IT security team has detected unusual login activity on your account. To protect your account, please reset your password immediately.</p><p><a href="{{tracking_url}}">Reset Password Now</a></p><p>If you do not reset within 24 hours, your account will be temporarily suspended.</p><p>IT Security Team</p></body></html>',
  'Dear {{employee_name}}, Our IT security team has detected unusual login activity. Reset your password at {{tracking_url}}',
  '{{company_name}} IT Security', 'itsecurity@{{company_domain}}',
  ARRAY['credential-harvesting', 'urgency', 'impersonation', 'it-support'],
  TRUE, 85
),
(
  uuid_generate_v4(),
  'CEO Wire Transfer Request',
  'Business Email Compromise (BEC) targeting finance teams',
  'email', 'finance', 'accountant', 4,
  'Urgent Wire Transfer Needed - Confidential',
  '<html><body><p>Hi {{employee_name}},</p><p>I need you to process an urgent wire transfer for a confidential acquisition we are finalizing today. Please do not discuss this with anyone else until the deal closes.</p><p>Amount: ${{amount}}<br>Beneficiary: {{beneficiary}}</p><p>Call me if you have questions. Time is critical.</p><p>{{ceo_name}}<br>Chief Executive Officer</p></body></html>',
  'Hi {{employee_name}}, I need you to process an urgent confidential wire transfer. Amount: ${{amount}}. This is time sensitive.',
  '{{ceo_name}} (CEO)', '{{ceo_email_lookalike}}',
  ARRAY['bec', 'wire-fraud', 'impersonation', 'executive', 'finance'],
  TRUE, 72
),
(
  uuid_generate_v4(),
  'DocuSign Document Ready',
  'Document signing urgency with credential harvesting',
  'email', 'general', 'employee', 3,
  'DocuSign: You have a document to sign',
  '<html><body style="font-family: Arial, sans-serif;"><img src="https://placeholder.com/docusign-logo.png" alt="DocuSign" width="150"/><h2>You have a document ready to sign</h2><p>Hello {{employee_name}},</p><p>{{sender_name}} has sent you a document to review and sign.</p><p style="text-align: center;"><a href="{{tracking_url}}" style="background: #F5A623; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">REVIEW DOCUMENT</a></p><p>This link expires in 24 hours.</p></body></html>',
  'You have a document to sign from {{sender_name}}. Review at {{tracking_url}}',
  'DocuSign via {{sender_name}}', 'dse@docusign.net.{{phishing_domain}}',
  ARRAY['document-signing', 'brand-impersonation', 'docusign', 'urgency'],
  TRUE, 80
);

-- Threat intelligence seed data
INSERT INTO threat_intelligence (title, description, severity, category, industries, source_url, published_at, is_active) VALUES
(
  'Cl0p Ransomware MOVEit Campaign',
  'Mass exploitation of MOVEit Transfer vulnerability (CVE-2023-34362) by Cl0p ransomware group targeting file transfer systems. Phishing lures impersonating MOVEit security notices.',
  'critical', 'ransomware',
  ARRAY['technology', 'finance', 'healthcare', 'government'],
  'https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-158a',
  '2023-06-16', TRUE
),
(
  'Business Email Compromise via Microsoft 365 Phishing',
  'Attackers using adversary-in-the-middle (AiTM) phishing kits to bypass MFA and compromise Microsoft 365 accounts for BEC fraud targeting CFOs and finance departments.',
  'high', 'bec',
  ARRAY['finance', 'real-estate', 'legal', 'manufacturing'],
  'https://www.microsoft.com/en-us/security/blog/2022/07/12/from-cookie-theft-to-bec/',
  '2024-01-15', TRUE
),
(
  'Credential Phishing via Fake HR Portals',
  'Widespread campaign targeting employees with fake HR self-service portals requesting login credentials under pretexts of benefits enrollment or policy acknowledgment.',
  'medium', 'credential-phishing',
  ARRAY['technology', 'retail', 'education', 'healthcare'],
  NULL,
  '2024-03-01', TRUE
);
