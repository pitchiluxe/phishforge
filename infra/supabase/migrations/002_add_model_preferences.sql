-- ============================================================
-- Add Model Management for Organizations
-- Version: 002_add_model_preferences.sql
-- ============================================================

-- Create table for organization model whitelist and preferences
CREATE TABLE organization_model_preferences (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  model_name      TEXT NOT NULL,
  is_enabled      BOOLEAN NOT NULL DEFAULT true,
  priority_order  INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(organization_id, model_name)
);

CREATE INDEX idx_model_prefs_org ON organization_model_preferences(organization_id);
CREATE INDEX idx_model_prefs_enabled ON organization_model_preferences(organization_id, is_enabled);

-- Add ai_model_preference column to organizations for default selection
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS preferred_ai_model TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS auto_select_model BOOLEAN NOT NULL DEFAULT true;

-- Enable RLS for organization_model_preferences
ALTER TABLE organization_model_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view/edit models for their organization
CREATE POLICY org_model_prefs_select ON organization_model_preferences
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY org_model_prefs_insert ON organization_model_preferences
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY org_model_prefs_update ON organization_model_preferences
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  ) WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY org_model_prefs_delete ON organization_model_preferences
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );
