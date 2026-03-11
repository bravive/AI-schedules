---
name: regen
description: Force regenerate today's task outputs, replacing any existing content.
user-invocable: true
---

# /regen — Force Regenerate Today's Outputs

## Arguments

- Optional: space-separated list of tasks to regenerate: `ai`, `news`, `stocks`
- If no arguments provided, regenerate ALL tasks

## Task Mapping

| Alias    | Task folder            | Script                        |
|----------|------------------------|-------------------------------|
| `ai`     | `ai-learning-engineer` | `scripts/generate-ai-learning.sh` |
| `news`   | `market-news`          | `scripts/generate-market-news.sh` |
| `stocks` | `stock-trader`         | `scripts/generate-stock-trader.sh` |

## Workflow

1. Determine today's date (`YYYY-MM-DD`)
2. If specific tasks were requested (e.g., `/regen stocks`), regenerate only those
3. If no tasks specified, regenerate ALL three tasks
4. For each task to regenerate:
   a. Delete the existing `output/<task-folder>/YYYY-MM-DD.html` if it exists
   b. Delete the existing `output/<task-folder>/latest.html` if it exists
   c. Run the corresponding shell script:
      ```bash
      bash scripts/generate-<task>.sh
      ```
5. After all tasks complete, run the manifest update:
   ```bash
   bash scripts/update-manifest.sh
   ```
6. Run validation tests:
   ```bash
   node tests/validate-html.js
   ```
7. Report which tasks were regenerated and confirm old content was replaced

## Important

- Scripts require `ANTHROPIC_API_KEY` environment variable — if not set, warn the user
- This ALWAYS overwrites existing content — that is the purpose of `/regen` vs `/gen`
- Each script handles writing the dated file and copying to `latest.html`
- The manifest update ensures the homepage reflects the new content
