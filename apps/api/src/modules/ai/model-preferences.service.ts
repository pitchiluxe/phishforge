import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { Logger } from '@nestjs/common';

export interface ModelPreference {
  id: string;
  organization_id: string;
  model_name: string;
  is_enabled: boolean;
  priority_order: number;
}

@Injectable()
export class ModelPreferencesService {
  private readonly logger = new Logger(ModelPreferencesService.name);

  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Get all model preferences for an organization
   */
  async getOrgModels(organizationId: string): Promise<ModelPreference[]> {
    const { data, error } = await this.supabase
      .db
      .from('organization_model_preferences')
      .select('*')
      .eq('organization_id', organizationId)
      .order('priority_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get enabled models only
   */
  async getEnabledModels(organizationId: string): Promise<ModelPreference[]> {
    const { data, error } = await this.supabase
      .db
      .from('organization_model_preferences')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_enabled', true)
      .order('priority_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Set model preference (create or update)
   */
  async setModelPreference(
    organizationId: string,
    modelName: string,
    isEnabled: boolean,
    priorityOrder: number = 0,
  ): Promise<ModelPreference> {
    const { data, error } = await this.supabase
      .db
      .from('organization_model_preferences')
      .upsert({
        organization_id: organizationId,
        model_name: modelName,
        is_enabled: isEnabled,
        priority_order: priorityOrder,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a model preference
   */
  async deleteModelPreference(
    organizationId: string,
    modelName: string,
  ): Promise<void> {
    const { error } = await this.supabase
      .db
      .from('organization_model_preferences')
      .delete()
      .eq('organization_id', organizationId)
      .eq('model_name', modelName);

    if (error) throw error;
  }

  /**
   * Update multiple model preferences (reorder, enable/disable batch)
   */
  async updateModelPreferencesBatch(
    organizationId: string,
    updates: Array<{
      model_name: string;
      is_enabled?: boolean;
      priority_order?: number;
    }>,
  ): Promise<ModelPreference[]> {
    // Validate all models exist for org
    const existingIds = (
      await this.getOrgModels(organizationId)
    ).map((m) => m.model_name);

    for (const update of updates) {
      if (!existingIds.includes(update.model_name)) {
        throw new BadRequestException(
          `Model ${update.model_name} not found for organization`,
        );
      }
    }

    // Update all
    const updated: ModelPreference[] = [];
    for (const update of updates) {
      const pref = await this.setModelPreference(
        organizationId,
        update.model_name,
        update.is_enabled ?? true,
        update.priority_order ?? 0,
      );
      updated.push(pref);
    }

    return updated;
  }

  /**
   * Set organization's preferred default model
   */
  async setPreferredModel(
    organizationId: string,
    modelName: string,
  ): Promise<void> {
    const { error } = await this.supabase
      .db
      .from('organizations')
      .update({ preferred_ai_model: modelName })
      .eq('id', organizationId);

    if (error) throw error;
    this.logger.log(
      `✓ Set preferred model for org ${organizationId}: ${modelName}`,
    );
  }

  /**
   * Toggle auto-select model feature for organization
   */
  async setAutoSelectModel(
    organizationId: string,
    enabled: boolean,
  ): Promise<void> {
    const { error } = await this.supabase
      .db
      .from('organizations')
      .update({ auto_select_model: enabled })
      .eq('id', organizationId);

    if (error) throw error;
    this.logger.log(
      `✓ Auto-select model ${enabled ? 'enabled' : 'disabled'} for org ${organizationId}`,
    );
  }
}
