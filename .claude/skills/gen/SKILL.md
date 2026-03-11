---
name: gen
description: Generate today's task outputs (ai, news, stocks). Specify tasks or auto-detect missing ones.
user-invocable: true
---

# /gen — Generate Today's Task Outputs

## Arguments

- Optional: space-separated list of tasks to generate: `ai`, `news`, `stocks`
- If no arguments provided, auto-detect which tasks are missing for today and generate only those

## Task Mapping

| Alias    | Task folder            | Script                        |
|----------|------------------------|-------------------------------|
| `ai`     | `ai-learning-engineer` | `scripts/generate-ai-learning.sh` |
| `news`   | `market-news`          | `scripts/generate-market-news.sh` |
| `stocks` | `stock-trader`         | `scripts/generate-stock-trader.sh` |

## Workflow

1. Determine today's date (`YYYY-MM-DD`)
2. If specific tasks were requested (e.g., `/gen ai stocks`), use those
3. If no tasks specified, check which `output/<task-folder>/YYYY-MM-DD.html` files are missing — only generate missing ones
4. If all outputs already exist, inform the user and stop
5. For each task to generate, run the corresponding shell script:
   ```bash
   bash scripts/generate-<task>.sh
   ```
6. After all tasks complete, run the manifest update:
   ```bash
   bash scripts/update-manifest.sh
   ```
7. Run validation tests:
   ```bash
   node tests/validate-html.js
   ```
8. Report which tasks were generated and any errors

## Important

- Scripts require `ANTHROPIC_API_KEY` environment variable — if not set, warn the user
- Do NOT regenerate tasks that already have today's output unless the user explicitly uses `/regen`
- Each script handles writing the dated file and copying to `latest.html`
