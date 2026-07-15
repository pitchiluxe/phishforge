'use client';

import { useState, useEffect } from 'react';
import { useFreeFreeModels } from '@/hooks/use-free-models';

interface ModelSetting {
  id: string;
  model_name: string;
  is_enabled: boolean;
  priority_order: number;
}

/**
 * Admin settings panel for managing AI model preferences
 * Allows orgs to enable/disable models and set priority order
 */
export function AiModelSettings() {
  const { models: availableModels, loading, error } = useFreeFreeModels();
  const [orgModels, setOrgModels] = useState<ModelSetting[]>([]);
  const [saving, setSaving] = useState(false);
  const [autoSelect, setAutoSelect] = useState(true);
  const [preferredModel, setPreferredModel] = useState<string>('');

  // Load org model preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const res = await fetch('/v1/ai/models/preferences', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setOrgModels(data.models || []);
        }
      } catch (err) {
        console.error('Failed to load model preferences:', err);
      }
    };

    loadPreferences();
  }, []);

  const handleToggleModel = async (modelName: string, isEnabled: boolean) => {
    setSaving(true);
    try {
      const res = await fetch('/v1/ai/models/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
        body: JSON.stringify({
          model_name: modelName,
          is_enabled: isEnabled,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setOrgModels((prev) => 
          prev.some(m => m.model_name === modelName)
            ? prev.map(m => m.model_name === modelName ? { ...m, is_enabled: isEnabled } : m)
            : [...prev, updated]
        );
      }
    } catch (err) {
      console.error('Failed to update model preference:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSetPreferred = async (modelName: string) => {
    setSaving(true);
    try {
      const res = await fetch('/v1/ai/models/preferences/default', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
        body: JSON.stringify({ model_name: modelName }),
      });

      if (res.ok) {
        setPreferredModel(modelName);
      }
    } catch (err) {
      console.error('Failed to set preferred model:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAutoSelect = async () => {
    setSaving(true);
    try {
      await fetch('/v1/ai/models/preferences/auto-select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
        body: JSON.stringify({ enabled: !autoSelect }),
      });
      setAutoSelect(!autoSelect);
    } catch (err) {
      console.error('Failed to toggle auto-select:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Loading models...</div>;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
      <h3 className="text-lg font-semibold mb-4">AI Model Settings</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Auto-Select Toggle */}
      <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={autoSelect}
            onChange={handleToggleAutoSelect}
            disabled={saving}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm font-medium">
            Auto-select best free model (recommended)
          </span>
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
          App will automatically test models and use the best available one
        </p>
      </div>

      {/* Available Models */}
      <div>
        <h4 className="text-sm font-medium mb-3">Available Models</h4>
        <div className="space-y-2">
          {availableModels.map((model: any) => {
            const modelPref = orgModels.find(m => m.model_name === model.id);
            const isEnabled = modelPref?.is_enabled ?? true;

            return (
              <div key={model.id} className="flex items-center gap-3 p-3 rounded border border-gray-200 dark:border-gray-700">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => handleToggleModel(model.id, e.target.checked)}
                  disabled={saving}
                  className="w-4 h-4 rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{model.name}</p>
                  {model.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {model.description}
                    </p>
                  )}
                </div>
                {isEnabled && (
                  <button
                    onClick={() => handleSetPreferred(model.id)}
                    disabled={saving}
                    className={`text-xs px-2 py-1 rounded ${
                      preferredModel === model.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                    }`}
                  >
                    {preferredModel === model.id ? '★ Preferred' : 'Set Default'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200">
        <p>
          <strong>Note:</strong> All available models are free. The app tests models sequentially
          and uses the first one that's available. Auto-select is recommended for best reliability.
        </p>
      </div>
    </div>
  );
}
