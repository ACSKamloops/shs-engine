# LLM Provider Configuration Guide

This guide explains how to configure the Pukaist Engine to work with different LLM providers.

## Supported Providers

The system uses the **OpenAI-compatible chat completions API** format, which is supported by most major providers:

| Provider | Base URL | Models | Notes |
|----------|----------|--------|-------|
| **OpenAI** | `https://api.openai.com` | `gpt-4o`, `gpt-5`, `gpt-5-nano` | Industry standard |
| **Google Gemini** | `https://generativelanguage.googleapis.com/v1beta/openai` | `gemini-2.5-flash`, `gemini-2.5-pro` | OpenAI-compatible endpoint |
| **Ollama** (local) | `http://localhost:11434/v1` | `llama3.2`, `mistral`, `codellama` | Free, runs locally |
| **Groq** | `https://api.groq.com/openai/v1` | `llama-3.1-70b-versatile` | Ultra-fast inference |
| **Together AI** | `https://api.together.xyz/v1` | `meta-llama/Llama-3.1-70B-Instruct` | Many open models |
| **OpenRouter** | `https://openrouter.ai/api/v1` | `google/gemini-2.5-flash`, etc. | Multi-provider gateway |

## Configuration Examples

### OpenAI GPT-4o

```bash
PUKAIST_LLM_OFFLINE=false
PUKAIST_LLM_PROVIDER=openai
PUKAIST_LLM_BASE_URL=https://api.openai.com
PUKAIST_LLM_MODEL=gpt-4o
PUKAIST_LLM_API_KEY=sk-your-openai-key
```

### Google Gemini

```bash
PUKAIST_LLM_OFFLINE=false
PUKAIST_LLM_PROVIDER=gemini
PUKAIST_LLM_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
PUKAIST_LLM_MODEL=gemini-2.5-flash
PUKAIST_LLM_API_KEY=your-gemini-api-key
```

> **Get a Gemini API key**: https://aistudio.google.com/apikey

### Local Ollama (Free, No API Key)

```bash
# First, install and run Ollama: https://ollama.ai
# ollama pull llama3.2
# ollama serve

PUKAIST_LLM_OFFLINE=false
PUKAIST_LLM_PROVIDER=ollama
PUKAIST_LLM_BASE_URL=http://localhost:11434/v1
PUKAIST_LLM_MODEL=llama3.2
PUKAIST_LLM_API_KEY=ollama
```

### Groq (Fast Inference)

```bash
PUKAIST_LLM_OFFLINE=false
PUKAIST_LLM_PROVIDER=groq
PUKAIST_LLM_BASE_URL=https://api.groq.com/openai/v1
PUKAIST_LLM_MODEL=llama-3.1-70b-versatile
PUKAIST_LLM_API_KEY=gsk_your-groq-key
```

## Security Best Practices

1. **Never commit `.env` to version control** - Use `.env.example` or `.env.local` as templates
2. **Use environment variables in production** - Set via your deployment platform
3. **Rotate API keys regularly** - Especially after any potential exposure
4. **Use least-privilege keys** - Create project-specific keys when possible

## Testing Your Configuration

```bash
# 1. Copy config
cp .env.local .env

# 2. Edit with your API key
nano .env

# 3. Start API
PYTHONPATH=. .venv/bin/uvicorn src.api:app --port 8000

# 4. Test LLM endpoint
curl -X POST http://localhost:8000/ask \
  -H "X-API-Key: dev-token" \
  -H "Content-Type: application/json" \
  -d '{"q": "What documents mention water rights?"}'
```

## Offline Mode (Default)

When `PUKAIST_LLM_OFFLINE=true`, the system uses heuristic processing:
- Summaries: First 400 characters of text
- Insights: Keyword extraction only
- No API calls are made

This is ideal for:
- Local development without API costs
- Air-gapped environments
- Testing pipeline logic without LLM dependencies
