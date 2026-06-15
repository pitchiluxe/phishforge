# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# PhishForge

AI-powered phishing simulation platform for authorized security awareness training.

> **Status:** Pre-code / planning phase. No application code exists yet. All architecture decisions below reflect the agreed design in `agent.md` and the original product vision.

---

## Target Architecture

### Monorepo Layout (planned)

```
phishforge/
├── api/node/          # Primary NestJS REST API (TypeScript)
├── sdk/node/          # Node.js client SDK
├── sdk/python/        # Python client SDK
├── sdk/go/            # Go client SDK
├── admin-ui/          # Next.js + TailwindCSS + ShadCN dashboard
├── infra/supabase/    # SQL migrations
├── infra/pinecone/    # Vector index config
├── .github/workflows/ # CI/CD (GitHub Actions)
└── docker-compose.yml
```

### Service Boundaries

| Layer | Technology | Role |
|-------|-----------|------|
| API Gateway | NestJS (Node.js, TypeScript) | Auth, routing, rate limiting, webhooks |
| AI Layer | GPT-4o via OpenAI SDK | Email generation, threat analysis, moderation |
| Vector DB | Pinecone | Per-tenant knowledge retrieval (RAG) |
| Database | Supabase PostgreSQL | Tenants, campaigns, audit logs, billing |
| Frontend | Next.js + TypeScript + TailwindCSS + ShadCN UI | Campaign management, analytics, admin |

### Core API Endpoints

```
POST /api/v1/generate   — generate phishing simulation
POST /api/v1/validate   — safety score (0–100) via OpenAI moderation
GET  /api/v1/stats      — usage metrics
POST /admin/delete-customer  — GDPR data purge (admin-only)
GET  /admin/dsr         — data subject access report
```

All responses are JSON. Version prefix is `/api/v1/`. Keep v1 stable once shipped.

### Multi-Tenancy Model

Every resource is scoped to an organization:

```
Organization → Users → Campaigns → Templates → Analytics → Billing
```

Supabase Row-Level Security (RLS) enforces tenant isolation — this is non-negotiable.

---

## Environment Variables

Copy `.env.local` and populate before running anything. Required vars:

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_BASE_URL` | OpenRouter base URL (currently proxying Claude/DeepSeek) |
| `ANTHROPIC_AUTH_TOKEN` | OpenRouter auth token |
| `ANTHROPIC_MODEL` | Model identifier (e.g. `deepseek/deepseek-v4-flash:free`) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase service role key (server-side only) |
| `PINECONE_API_KEY` | Pinecone access token |
| `PINECONE_ENV` | Pinecone environment (e.g. `us-west1-gcp`) |
| `OPENAI_API_KEY` | OpenAI key for GPT-4o generation and moderation |
| `DATABASE_URL` | PostgreSQL connection string |

Optional with defaults:

| Variable | Default | Purpose |
|----------|---------|---------|
| `RATE_LIMIT_GENERATE` | `30` | Requests/min per API key for `/generate` |
| `RATE_LIMIT_VALIDATE` | `60` | Requests/min per API key for `/validate` |
| `WEBHOOK_TIMEOUT_MS` | `5000` | Max ms to wait for webhook delivery |
| `GDPR_RETENTION_DAYS` | `365` | Days to keep audit logs before auto-purge |
| `DOCKER_REGISTRY` | `ghcr.io` | Target registry for Docker image pushes |

---

## Key Engineering Constraints

- **Safety score gate:** If OpenAI moderation returns score < 70, flag and return issues instead of delivering content.
- **Attachment handling:** Store attachment content only as base64 in memory — never persist to disk.
- **Audit trail:** Every `/generate` call must log a hashed `emailId` + timestamp. No raw personal data persisted.
- **Rate limiting:** Enforce per-API-key limits at the middleware layer before hitting the AI layer.
- **Webhook delivery:** Accept `webhookUrl` in `/generate` body; POST `{emailId, status, timestamp}` after simulated delivery.
- **Pinecone caching:** Cache query results per tenant for 5 minutes to reduce latency and cost.

---

## SDK Conventions

All three SDKs (Node, Python, Go) must expose the same logical interface:

```typescript
// Node — canonical example
const campaign = await phishforge.generate({
  industry: "finance",
  targetRole: "accountant",
  objective: "security-awareness",
  webhookUrl: "https://...",
});
```

TypeScript SDK uses full type hints. Python SDK uses type hints + dataclasses. Go SDK uses interfaces.

---

## CI/CD

`.github/workflows/ci.yml` must:
1. Run lint + unit tests
2. Build Docker image and push to `ghcr.io`
3. Execute a `/generate` test call with a fixed payload and log the response

Security scans in CI: `npm audit`, `bandit` (Python), `go vet`.

---

## Agent Configuration

See `agent.md` for the full agent spec including the GPT-4o system prompt used for email synthesis, available tools, and example interactions.
