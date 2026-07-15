# AI Model Management System

Dynamic model discovery and management for PhishForge — eliminates hardcoded model lists.

## Overview

The app now automatically:
- Discovers available free models from OpenRouter API
- Tests models sequentially to find working ones
- Caches results for 10 minutes to reduce API calls
- Allows organizations to enable/disable/reorder models

**Goal:** Never need to update code when OpenRouter adds/removes free models.

## Architecture

### Backend (apps/api)

#### OpenRouterService (`openrouter.service.ts`)

Smart model management with caching:

```typescript
// 10-minute cache of free models
private cachedFreeModels: OpenRouterModel[] | null = null;
private lastCacheTime = 0;
private readonly CACHE_DURATION_MS = 10 * 60 * 1000;

// Preferred models tested in order (fallback if all fail)
private readonly PREFERRED_FREE_MODELS = [
  'meta-llama/llama-3.2-90b-vision-instruct:free',
  'meta-llama/llama-3.1-70b-instruct:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  // ...
];
```

**Key Methods:**

- `getAvailableModels()` — Fetches all models from OpenRouter API
- `getFreeModels(skipCache?)` — Returns free models, uses cache if valid
- `getBestFreeModels()` — Returns free models sorted by preference order + context size
- `getWorkingFreeModel()` — Iterates through preferred models, tests each, returns first working one

**Caching Strategy:**
- Cache hits are logged as debug (not shown by default)
- Cache misses trigger fresh API fetch
- TTL: 10 minutes (configurable via `CACHE_DURATION_MS`)

---

#### ModelPreferencesService (`model-preferences.service.ts`)

Organization-scoped model management:

```typescript
// Table: organization_model_preferences
{
  id: UUID,
  organization_id: UUID,
  model_name: string,
  is_enabled: boolean,
  priority_order: integer,
}
```

**Methods:**
- `getOrgModels(orgId)` — All models for org
- `getEnabledModels(orgId)` — Enabled models only
- `setModelPreference(orgId, modelName, isEnabled, priorityOrder)` — Upsert preference
- `deleteModelPreference(orgId, modelName)` — Remove preference
- `setPreferredModel(orgId, modelName)` — Set org's default model
- `setAutoSelectModel(orgId, enabled)` — Toggle auto-select feature

---

#### AI Controller Endpoints

**Model Discovery:**
- `GET /v1/ai/models/openrouter/free` — All free models (cached)
- `GET /v1/ai/models/openrouter/free/best` — Free models sorted by preference
- `GET /v1/ai/models/openrouter/working-free` — Best working free model

**Model Preferences (org-scoped):**
- `GET /v1/ai/models/preferences` — Get org's model preferences
- `GET /v1/ai/models/preferences/enabled` — Get enabled models only
- `POST /v1/ai/models/preferences` — Create/update preference
- `DELETE /v1/ai/models/preferences/:modelName` — Remove preference
- `PUT /v1/ai/models/preferences/batch` — Bulk update preferences
- `POST /v1/ai/models/preferences/default` — Set preferred model
- `POST /v1/ai/models/preferences/auto-select` — Toggle auto-select

---

### Frontend (apps/web)

#### Hook: `useFreeFreeModels()` (`use-free-models.ts`)

Fetches available models from backend API:

```typescript
const { models, loading, error } = useFreeFreeModels();
// Returns:
// - models: FreeModel[] (sorted by preference)
// - loading: boolean
// - error: string | null
```

**Fallback Behavior:**
- If API fails, uses hardcoded `FALLBACK_FREE_MODELS` list
- Models are sorted by preference + context size
- Caching happens on backend, not frontend

---

#### Function: `getWorkingFreeModel(token?)` 

Gets the best working model from API:

```typescript
const model = await getWorkingFreeModel();
// Returns: string (model name)
```

---

#### Component: `AiModelSettings` (`ai-model-settings.tsx`)

Admin settings UI for model management:

```typescript
<AiModelSettings />
```

**Features:**
- Toggle "Auto-select best model"
- Enable/disable individual models
- Set preferred default model (shows ★ when selected)
- Display model descriptions + context lengths
- Real-time updates via API

---

#### Integration: Course/Lab Generation

`apps/web/src/app/api/classroom/generate/route.ts`

```typescript
// Fetch dynamic model list before generating
const modelList = await getAvailableModels();

// Pass to callOpenRouter
const result = await callOpenRouter(
  messages,
  { maxTokens: 2000, temperature: 0.8, modelList },
);
```

**Behavior:**
- Fetches from backend `/v1/ai/models/openrouter/free/best`
- Falls back to `FALLBACK_FREE_MODELS` if API unavailable
- Passes list to `callOpenRouter()` for sequential testing

---

### OpenRouter Client (`lib/ai/openrouter.ts`)

Updated `callOpenRouter()` signature:

```typescript
export async function callOpenRouter(
  messages: OAMessage[],
  opts?: {
    maxTokens?: number;
    temperature?: number;
    primaryModel?: string;
    modelList?: string[]; // ← NEW: Dynamic model list
  }
) {
  const models = opts?.modelList || FALLBACK_FREE_MODELS;
  // ... test models sequentially
}
```

---

## Database Schema

### Migration: `002_add_model_preferences.sql`

New table for organization model preferences:

```sql
CREATE TABLE organization_model_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL,
  model_name TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  priority_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, model_name)
);
```

New columns on `organizations`:
- `preferred_ai_model TEXT` — Org's default model
- `auto_select_model BOOLEAN DEFAULT true` — Auto-select feature enabled?

---

## How It Works

### 1. App Startup

```
OpenRouterService initializes
  → Check PREFERRED_FREE_MODELS
  → Cache: empty, TTL: 0
```

### 2. First Request (e.g., generate course)

```
Frontend calls /v1/ai/models/openrouter/free/best
  → Backend: getFreeModels()
    → Check cache: expired, fetch from API
    → Parse OpenRouter response
    → Filter: pricing.prompt === 0 && pricing.completion === 0
    → Store in cache with TTL
    → Return sorted by preference + context size
  → Frontend: passes to callOpenRouter()
    → Tries model 1 (with 429 retry)
    → Tries model 2, etc.
    → Returns first success
```

### 3. Cache Hit (within 10 min)

```
Frontend calls /v1/ai/models/openrouter/free/best
  → Backend: getFreeModels()
    → Check cache: valid
    → Return cached models (log: debug)
  → Much faster (no API call to OpenRouter)
```

### 4. Auto-Select Best Model

```
Frontend: callOpenRouter(msgs, { modelList })
  → Try llama-3.2-90b-vision (preferred, first in list)
  → If 429/timeout: retry once
  → If still fails: try llama-3.1-70b (next in list)
  → Continue until success
  → Return { content, model, tokens }
```

### 5. Organization Settings

```
Admin updates model preferences:
  POST /v1/ai/models/preferences/batch
    → Disable: meta-llama/llama-3.1-8b (too slow)
    → Reorder: Put gpt-3.5-turbo first
  → Stored in organization_model_preferences table
  → On next generation, respects org's preferences
```

---

## Workflow: Adding a New Model

### Scenario: OpenRouter adds `new-model:free`

**Before (old system):**
1. Model becomes available on OpenRouter
2. **Developer manually adds to `FALLBACK_FREE_MODELS` array**
3. Deploy code
4. App uses new model

**After (new system):**
1. Model becomes available on OpenRouter
2. **NO CODE CHANGE NEEDED**
3. On next request:
   - `getFreeModels()` fetches from API
   - Automatically includes new model
   - App tests and uses it

---

## Workflow: Model Becomes Paid-Only

### Scenario: `deepseek/deepseek-r1-0528:free` → paid-only (what broke us before)

**Before:**
```
Model fails with 404
→ App crashes
→ Engineer must manually remove from FALLBACK_FREE_MODELS
→ Deploy
→ Test
→ Hope nothing else is broken
```

**After:**
```
Model fails with 404
→ OpenRouter API returns it with pricing.prompt > 0
→ getFreeModels() filters it out automatically
→ App never tries it
→ No code changes needed
→ All environments fixed automatically
```

---

## Configuration

### Environment Variables (already set)

```bash
# .env.local

# OpenRouter
OPENROUTER_API_KEY=sk_or_...
OPENROUTER_DEFAULT_MODEL=meta-llama/llama-3.1-8b-instruct:free
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_SITE_URL=https://phishforge.ai
OPENROUTER_SITE_NAME=PhishForge
```

### Code Configuration (in OpenRouterService)

```typescript
// Cache TTL
private readonly CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

// Preferred models (fallback order)
private readonly PREFERRED_FREE_MODELS = [
  'meta-llama/llama-3.2-90b-vision-instruct:free',
  'meta-llama/llama-3.1-70b-instruct:free',
  // ... updated regularly based on OpenRouter status
];
```

---

## Testing

### Test 1: Fresh Models from API

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/v1/ai/models/openrouter/free/best
  
# Should return:
# {
#   "models": [
#     { "id": "meta-llama/...", "name": "...", "pricing": { "prompt": "0", ... } },
#     ...
#   ],
#   "count": 15,
#   "message": "Found 15 free models ranked by preference"
# }
```

### Test 2: Cached Response

```bash
# Wait 1 second, call again
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/v1/ai/models/openrouter/free/best
  
# Should return same models much faster (no API call logged)
```

### Test 3: Get Working Model

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/v1/ai/models/openrouter/working-free
  
# Should return:
# {
#   "model": "meta-llama/llama-3.1-70b-instruct:free",
#   "message": "Using free model: meta-llama/llama-3.1-70b-instruct:free"
# }
```

### Test 4: Course Generation

```bash
curl -X POST http://localhost:3000/api/classroom/generate \
  -H "Content-Type: application/json" \
  -d '{ "type": "course", "topic": "Social Engineering", "difficulty": "beginner" }'
  
# Should auto-select a model and generate course
```

---

## Troubleshooting

### "Cache returns old models"

Cache expires after 10 minutes. Force refresh by:

```typescript
// Skip cache
const freshModels = await openRouter.getFreeModels(skipCache = true);
```

Or wait 10 minutes for automatic refresh.

---

### "Model I disabled still gets used"

Organization preferences not saved in DB. Solutions:

1. **Check:** Did admin click "Set Default" or just toggle?
   - Toggling saves immediately to `organization_model_preferences`
   - Setting default saves to `organizations.preferred_ai_model`

2. **Frontend:** Clear localStorage cache
   ```typescript
   localStorage.removeItem('model_cache');
   ```

3. **Backend:** Check Supabase table
   ```sql
   SELECT * FROM organization_model_preferences WHERE organization_id = 'xyz';
   ```

---

### "All models failing"

Check OpenRouter API status:

```typescript
const allModels = await openRouter.getAvailableModels();
console.log(allModels.length); // Should be > 100
```

If empty, OpenRouter API might be down.

---

## Next Steps

**Optional Enhancements:**
1. Add model availability monitoring/webhooks
2. Store model test results + latency for better ranking
3. Per-user model preferences (not just org-wide)
4. Cost tracking per model (if OpenRouter changes pricing)
5. Real-time model health dashboard for admins
6. Automatic fallback to Ollama if all free models fail

---

## Summary

| Before | After |
|--------|-------|
| Hardcoded model lists in code | Auto-discovered from OpenRouter API |
| Model changes → manual code update → deploy | Model changes → no code change needed |
| One model fails → entire app breaks | One model fails → app automatically tries next |
| Cache expires → manual restart | Cache expires → automatic refresh (10 min TTL) |
| No way to manage per-org | Org-level settings + admin UI |

**Result:** App automatically adapts to OpenRouter changes. No more "deepseek-r1 broke everything" incidents.
