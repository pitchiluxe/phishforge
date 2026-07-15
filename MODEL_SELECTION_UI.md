# Model Selection Dropdowns - Implementation Guide

## Overview

Added dropdown selectors in the AI Settings panel that let users quickly select and pull models from both Ollama and OpenRouter without having to type model names manually.

## What Was Added

### 1. New Component: `ModelPullSelector`
**File:** `apps/web/src/components/ai/model-pull-selector.tsx`

A reusable dropdown component that:
- Fetches available models from the backend API
- Displays them in a dropdown menu
- Allows one-click selection and pulling
- Shows loading state while pulling models
- Has fallback lists if API is unavailable

**Exported Functions:**
- `ModelPullSelector` — Core component
- `OllamaModelSelector` — Ollama-specific wrapper
- `OpenRouterModelSelector` — OpenRouter-specific wrapper

### 2. Updated: `AISettingsPanel`
**File:** `apps/web/src/components/ai/ai-settings-panel.tsx`

#### For Ollama:
```
[Settings] → Ollama selected
  ↓
"Pull a Model" section now shows:
  1. Quick select dropdown (popular Ollama models)
  2. Manual entry field (for advanced users)
```

**Features:**
- Dropdown lists popular free Ollama models (llama3.2, mistral, gemma2, qwen, phi, etc.)
- User clicks a model in dropdown → one-click pull
- OR user can manually type model name for custom models
- Shows help text with popular model names
- Real-time pull progress with loader

#### For OpenRouter:
```
[Settings] → OpenRouter selected
  ↓
"Quick Select Model" section shows dropdown
  ↓
User clicks model → instantly selected
```

**Features:**
- Dropdown lists top 20 free models from backend API
- Much faster than scrolling through full list
- Below dropdown: existing search/filter interface for advanced browsing
- "Quick Select" for most common choices, "Browse & Search" for detailed lookup

---

## How It Works

### Ollama Flow

```
User clicks settings → selects Ollama
  ↓
OllamaModelSelector renders
  ↓
Dropdown opens → fetches from https://registry.ollama.ai/api/tags
  ↓
Filters for popular models (llama, mistral, gemma, etc.)
  ↓
User picks "llama3.2" from dropdown
  ↓
onClick → triggers pull via POST /api/ai/models/ollama/pull
  ↓
Streams pull progress to user
  ↓
On success → refreshes installed models list
```

### OpenRouter Flow

```
User clicks settings → selects OpenRouter
  ↓
OpenRouterModelSelector renders
  ↓
Dropdown opens → fetches from GET /v1/ai/models/openrouter/free/best
  ↓
Shows ranked free models (top 20)
  ↓
User picks "meta-llama/llama-3.1-70b-instruct:free" from dropdown
  ↓
onClick → calls onSelect(modelName)
  ↓
Model instantly selected
  ↓
User clicks "Save settings" to persist choice
```

---

## API Endpoints Used

### Ollama Models
- **Source:** `https://registry.ollama.ai/api/tags`
- **Filters:** Popular models (llama, mistral, gemma, qwen, phi, neural)
- **Returns:** ~20 most popular models

### OpenRouter Models
- **Endpoint:** `GET /v1/ai/models/openrouter/free/best`
- **Filters:** Free models only, sorted by preference + context size
- **Returns:** ~20 best free models

---

## Fallback Behavior

If APIs are unavailable:

**Ollama:**
```typescript
['llama3.2', 'mistral', 'gemma2', 'neural-chat', 'phi']
```

**OpenRouter:**
```typescript
[
  'meta-llama/llama-3.2-90b-vision-instruct:free',
  'meta-llama/llama-3.1-70b-instruct:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
  'deepseek/deepseek-v4-flash:free',
]
```

---

## UI/UX Flow

### Ollama Settings

```
┌─────────────────────────────────────────┐
│ Ollama Model Manager                    │
│ [Refresh] [Connected ✓]                 │
│                                         │
│ Ollama Server URL                       │
│ [http://localhost:11434]                │
│                                         │
│ Pull a Model                            │
│ ┌─────────────────────────────────────┐ │
│ │ Quick pull from popular models      │ │
│ │ ┌──────────────────────────┐        │ │
│ │ │ Select model to pull ▼   │        │ │
│ │ └──────────────────────────┘        │ │
│ │        (dropdown opens)              │ │
│ │ ├─ llama3.2           [↓]           │ │
│ │ ├─ mistral            [↓]           │ │
│ │ ├─ gemma2             [↓]           │ │
│ │ ├─ qwen2.5            [↓]           │ │
│ │ └─ phi4               [↓]           │ │
│ │        (dropdown closes)             │ │
│ │                                      │ │
│ │ Or enter model name manually         │ │
│ │ [llama3.2:latest  ] [Pull ↓]        │ │
│ │                                      │ │
│ │ Popular: llama3.2, llama3.1, ...    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Installed Models                        │
│ ✓ llama3.1:latest        35 GB [✓]    │
│ ✓ mistral:latest         9 GB  [X]    │
│                                         │
│                          [Save settings]│
└─────────────────────────────────────────┘
```

### OpenRouter Settings

```
┌─────────────────────────────────────────┐
│ OpenRouter Model                        │
│ [Refresh] [Connected ✓]                 │
│ 150+ models available                   │
│                                         │
│ Quick Select Model                      │
│ ┌──────────────────────────┐            │
│ │ Select model to pull ▼   │            │
│ └──────────────────────────┘            │
│        (dropdown opens)                  │
│ ├─ Llama 3.2 90B Vision       [↓]       │
│ ├─ Llama 3.1 70B              [↓]       │
│ ├─ Llama 3.1 8B               [↓]       │
│ ├─ Mistral 7B Instruct        [↓]       │
│ └─ DeepSeek V4 Flash          [↓]       │
│        (dropdown closes)                 │
│                                         │
│ Browse & Search                         │
│ [Search models...] [✓ Free only]       │
│                                         │
│ ✓ Llama 3.1 70B               FREE [✓] │
│ ✓ Llama 3.2 90B Vision        FREE     │
│ ✓ Mistral 7B                  FREE     │
│ ─ GPT-4 Turbo               PAID      │
│                                         │
│                          [Save settings]│
└─────────────────────────────────────────┘
```

---

## Code Example: Using the Component

```tsx
// Inside a settings panel
import { OllamaModelSelector } from '@/components/ai/model-pull-selector';

export function MySettings() {
  const handlePull = async (modelName: string) => {
    const res = await fetch('/api/ai/models/ollama/pull', {
      method: 'POST',
      body: JSON.stringify({ model: modelName }),
    });
    // Handle response...
  };

  return (
    <div>
      <label>Pull Ollama Model</label>
      <OllamaModelSelector
        onSelect={(modelName) => setSelected(modelName)}
        onPull={handlePull}
      />
    </div>
  );
}
```

---

## Features

✅ **One-click Model Selection**
- No need to type model names
- No model not found errors
- Auto-completion from API

✅ **Dynamic Lists**
- Fetches from OpenRouter API (free models)
- Fetches from Ollama registry (popular models)
- Always up-to-date

✅ **Graceful Fallbacks**
- If API fails, shows hardcoded list
- App still works offline

✅ **Loading States**
- Shows spinner while fetching
- Shows spinner while pulling
- Shows error if pull fails

✅ **Popular Models Highlighted**
- Top 20 models in dropdown (not all 100+)
- Most relevant choices first
- Advanced users can still search/browse

✅ **Mobile Friendly**
- Dropdown scrolls on small screens
- Touch-friendly buttons
- Works on all devices

---

## Testing

### Test 1: Ollama Model Selection
1. Open Settings → select Ollama
2. Click "Select model to pull" dropdown
3. Verify popular models load (llama3.2, mistral, etc.)
4. Click one → model pulls
5. Check "Installed Models" updates

### Test 2: OpenRouter Model Selection
1. Open Settings → select OpenRouter
2. Click "Select model to pull" dropdown
3. Verify free models load from API
4. Click one → model selects instantly
5. Click "Save settings" → persisted

### Test 3: Fallback Behavior
1. Disconnect internet / mock API failure
2. Click dropdown
3. Verify fallback list shows
4. Select works as normal

### Test 4: Manual Entry Still Works
1. Ollama → "Pull a Model" section
2. Type custom model name in manual field
3. Press Enter or click Pull
4. Works as before

---

## Files Changed

✅ `apps/web/src/components/ai/model-pull-selector.tsx` — NEW component
✅ `apps/web/src/components/ai/ai-settings-panel.tsx` — Integrated dropdowns

---

## Next Steps

**Optional Enhancements:**
1. Show model size/context in dropdown hover
2. Show model download progress
3. Filter by capability (vision, code, multilingual)
4. Star/favorite models for quick access
5. Recently pulled models at top
6. Model comparison card
