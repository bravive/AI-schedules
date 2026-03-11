# CLAUDE.md — Project Rules

## Git Workflow

- All Claude development happens on `claude/*` branches
- Claude branches auto-merge to `main` via GitHub Actions (`auto-merge-claude.yml`)
- Always push to the designated `claude/` branch, never directly to `main`

## Project Structure

- Each scheduled task maintains its own independent folder under `tasks/<task-name>/`
- Each task has its own prompt (`prompt.md`) and output folder (`output/<task-name>/`)
- AI Learning task also has `tasks/ai-learning-engineer/progress.json` for YouTube video tracking
- All task artifacts are merged and presented on the single homepage (`index.html`)
- Shared design system lives in `shared/css/style.css` — all pages must use it for consistent UI
- `output/manifest.json` tracks all outputs with `latest` and `archive` fields

## Scheduled Tasks

| Task | Folder | Description |
|------|--------|-------------|
| **AI Learning Engineer** | `tasks/ai-learning-engineer/` | Course-style lessons from YouTube videos: prerequisites, glossary, concept teaching with analogies, code walkthroughs, exercises |
| **Stock Trader** | `tasks/stock-trader/` | Pre-market analysis with top stocks, market overview, disclaimers |
| **Market News** | `tasks/market-news/` | Market mood, 10+ news stories, crypto section, sentiment indicators |

- All tasks run daily at **7:00 AM PST** (3:00 PM UTC) via GitHub Actions
- Tasks call the **Claude API** (`claude-sonnet-4-20250514`) to generate HTML output
- Generated outputs are committed back to the repo automatically
- The site is served via **GitHub Pages** — users only need to open a bookmarked URL

## Adding New Tasks

1. Create `tasks/<task-name>/prompt.md` with the AI prompt
2. Create `scripts/generate-<task-name>.sh` to call the Claude API
3. Add a job to `.github/workflows/daily-briefing.yml`
4. Update `scripts/update-manifest.sh` to include the new task
5. Add a card to `index.html`
6. Add test validations to `tests/validate-html.js`

## Skills (Slash Commands)

### `/gen [ai|news|stocks]`
Generate missing outputs for today. Auto-detects which tasks need generation if no args given. Runs manifest update and tests after generation.

### `/regen [ai|news|stocks]`
Force regenerate outputs, overwriting existing ones. If no args, regenerates all three tasks.

### `/pick-task`
Task selection workflow — reads from `claude-plan/0.TODO.md`, creates task files and tracks progress.

### `/release`
Release workflow — runs tests, commits changes, and pushes to remote.

## Testing

- **Always run tests before pushing:** `node tests/validate-html.js`
- **191 validation checks** covering:
  - **File structure (9):** All required files exist (prompts, scripts, outputs, CSS, workflow)
  - **CSS system (9):** Required design system classes present
  - **Homepage (13):** 3 task cards with bullet summaries, sidebar groups, JS functions (showDashboard, loadEntry, openTask), manifest fetch, iframe nav-back
  - **Output pages (36):** HTML structure per task (DOCTYPE, meta, CSS, header, footer, nav-back, date matching, balanced tags, >200 chars body)
  - **AI Learning specific (7):** YouTube links, session progress format, key concepts, exercises, roadmap, prerequisites, glossary
  - **Stock Trader specific (6):** Stock table, 5+ stock symbols, market overview, disclaimer, wide container
  - **Market News specific (6):** Market mood, 8+ news stories, crypto section, disclaimer, sentiment indicators
  - **Manifest (8):** Correct structure, all 3 task types in latest, referenced files exist
  - **progress.json (12):** Valid video tracking with YouTube URLs, selection reasons, session counts, topic queue
  - **Scripts (6):** Bash shebang, strict mode, API key references, progress.json reading
  - **Workflow (3):** All 3 job names, publish job depends on all generators
- If tests fail, fix the issues before pushing

## UI / Frontend

- Use the shared design system (`shared/css/style.css`) for all pages
- Dark theme with color palette: bg #0f1117, surface #1a1d27, accent #6c8cff
- Typography: Inter (sans) + JetBrains Mono (mono)
- Homepage: 2-panel layout with sidebar (manifest-driven archive) + main area (dashboard cards or iframe viewer)
- All pages must be readable and mobile-friendly (sidebar collapses at <768px)
- Each task page links back to the dashboard via `.nav-back`

## Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `daily-briefing.yml` | Cron (3:00 PM UTC) + manual | Generates all 3 task outputs, updates manifest, commits |
| `auto-merge-claude.yml` | Push to `claude/**` | Auto-merges Claude branches to main (--no-ff) |
| `deploy-pages.yml` | Push to main (index.html, output/**, shared/**) + after daily-briefing | Deploys site to GitHub Pages |
