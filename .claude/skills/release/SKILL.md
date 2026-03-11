---
name: release
description: Run tests, commit any uncommitted changes, and push to remote
disable-model-invocation: true
user-invocable: true
---

# Release Workflow

1. **Run tests** — `npm test` and confirm all pass
2. **Check for uncommitted changes** — `git status`
3. **Commit** any uncommitted changes with an appropriate message
4. **Push** — `git push origin main`
