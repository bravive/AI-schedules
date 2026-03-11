---
name: pick-task
description: Pick the next task from the TODO list, create a tracking file, and implement it
disable-model-invocation: true
user-invocable: true
---

# Pick Task Workflow

1. **Read** `claude-plan/0.TODO.md` to see the current task list
2. **Pick** the next uncompleted `[ ]` task (top-down priority)
3. **Create a task file** under `claude-plan/` named `<number>.<short-name>.md` (e.g., `1.add-timer.md`)
4. **Update `0.TODO.md`** — add the task file name next to the picked task for cross-reference:
   ```
   - [~] Task description — `1.task-name.md`
   ```
5. **Populate the task file** with this template:
   ```markdown
   # <N>. Task Title

   ## Status: In Progress

   ## Description
   What this task accomplishes.

   ## Plan
   1. Step one
   2. Step two

   ## Notes
   - Decisions, blockers, observations
   ```
6. **Implement** the task following all CLAUDE.md rules (tests, review, commit, etc.)
7. **Update status** in both files when done:
   - Mark task as `[x]` in `0.TODO.md`
   - Change status to `Done` in the task-specific file
