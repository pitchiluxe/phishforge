# Free Model Selection Strategy

## Overview

PhishForge now automatically selects the best **free** working model from OpenRouter. This prevents API failures when paid models become unavailable or when free tier status changes.

## How It Works

1. **Smart Detection**: On first generation request, the system tests preferred free models in order
2. **Model Caching**: The working model is cached for 5 minutes to avoid repeated tests
3. **Fallback**: If no free model is available, uses the `OPENROUTER_DEFAULT_MODEL` env var

## Preferred Free Models (in order)

```
✓ meta-llama/llama-3.2-90b-vision-instruct:free  (best)
✓ meta-llama/llama-3.1-70b-instruct:free
✓ meta-llama/llama-3.1-8b-instruct:free          (default fallback)
✓ mistralai/mistral-7b-instruct:free
✓ gpt-3.5-turbo                                   (last resort)
```

## Configuration

### .env.local

```bash
# Primary free model fallback (when no others work)
OPENROUTER_DEFAULT_MODEL=meta-llama/llama-3.1-8b-instruct:free
```

The system will **override this** with a better free model if one is found to work.

## API Endpoints

### 1. Find Working Free Model
```bash
GET /v1/ai/models/openrouter/working-free
Authorization: Bearer <jwt>
```

**Response:**
```json
{
  "model": "meta-llama/llama-3.1-70b-instruct:free",
  "message": "Using free model: meta-llama/llama-3.1-70b-instruct:free"
}
```

### 2. List All Free Models
```bash
GET /v1/ai/models/openrouter/free
Authorization: Bearer <jwt>
```

**Response:** Array of models with `pricing.prompt = 0` and `pricing.completion = 0`

## Logs

Watch for these logs when generating content:

```
[OpenRouterService] ✓ Found working free model: meta-llama/llama-3.1-70b-instruct:free
[AIService] Using cached free model: meta-llama/llama-3.1-70b-instruct:free
[AIService] Model cache expired or not set, finding best free model...
```

## Troubleshooting

### "All free models are down"
The system falls back to `OPENROUTER_DEFAULT_MODEL`. Update it to a known working paid model:

```bash
OPENROUTER_DEFAULT_MODEL=openai/gpt-4o-mini  # or another model
```

### "Model cache stale"
The cache expires every 5 minutes. To force a refresh on next request, restart the API.

### Test a specific model
```bash
POST /v1/ai/generate
{
  "ai_provider": "openrouter",
  "ai_model": "meta-llama/llama-3.1-70b-instruct:free",
  ...
}
```

## Future Improvements

- [ ] Dynamic model reranking based on success/latency metrics
- [ ] Automatic cache invalidation on model unavailability
- [ ] Per-organization model preferences
- [ ] Model fallback chain (try 3 models before giving up)
