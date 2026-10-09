# Kenerate AI Creative Workflow MCP

Deterministic, read-only MCP tools and an OpenClaw Skill for structuring image, video, and audio briefs, selecting a public workflow, auditing prompt completeness, and discovering canonical Kenerate AI resources.

The server does not call models, upload media, access accounts, consume credits, submit jobs, or promise output quality, pricing, or current model availability.

## Install

```bash
npx -y github:gpt-img-2/kenerateai-creative-workflow-mcp
```

## Tools

- `build_creative_brief`
- `choose_generation_workflow`
- `audit_generation_prompt`
- `get_kenerateai_resources`

## OpenClaw

```bash
openclaw mcp add kenerateai --command npx --arg -y --arg github:gpt-img-2/kenerateai-creative-workflow-mcp
```

The Skill source is in [`openclaw/kenerateai-creative-workflow`](openclaw/kenerateai-creative-workflow/SKILL.md).

## Development

```bash
pnpm install
pnpm validate
```

Canonical product resources: [kenerateai.org/llms.txt](https://kenerateai.org/llms.txt)
