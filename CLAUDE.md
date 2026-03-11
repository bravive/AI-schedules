# CLAUDE.md — Project Rules

## Git Workflow

- All Claude development happens on `claude/*` branches
- Claude branches auto-merge to `main` via GitHub Actions on push
- Always push to the designated `claude/` branch, never directly to `main`

## Project Structure

- Each scheduled task maintains its own independent folder under `tasks/<task-name>/`
- Each task has its own prompt (`prompt.md`) and output folder (`output/<task-name>/`)
- All task artifacts are merged and presented on the single homepage (`index.html`)
- Shared design system lives in `shared/css/style.css` — all pages must use it for consistent UI

## Scheduled Tasks

- All tasks run daily at **7:00 AM PST** via GitHub Actions
- Tasks call the **Claude API** to generate HTML output
- Generated outputs are committed back to the repo automatically
- The site is served via **GitHub Pages** — users only need to open a bookmarked URL

## Adding New Tasks

1. Create `tasks/<task-name>/prompt.md` with the AI prompt
2. Create `scripts/generate-<task-name>.sh` to call the Claude API
3. Add a job to `.github/workflows/daily-briefing.yml`
4. Update `scripts/update-manifest.sh` to include the new task
5. Add a card to `index.html`

## Commands

### `/generate today`
When the user says `/generate today`:
1. Check if today's artifacts already exist in `output/<task-name>/YYYY-MM-DD.html`
2. If they exist, skip generation and inform the user
3. If they don't exist, generate all task artifacts:
   - Read each task's `prompt.md`
   - Generate the HTML content following the prompt instructions
   - Wrap the content in the standard page template (header, nav-back, footer) using `shared/css/style.css`
   - Save to `output/<task-name>/YYYY-MM-DD.html`
   - Copy to `output/<task-name>/latest.html`
   - Update `output/manifest.json` via `scripts/update-manifest.sh`
4. Commit and push the generated artifacts

## UI / Frontend

- Use the shared design system (`shared/css/style.css`) for all pages
- Dark theme, consistent typography (Inter + JetBrains Mono)
- All pages must be readable and mobile-friendly
- Each task page links back to the dashboard
