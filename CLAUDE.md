## Mandatory Skills

These skills MUST be used proactively. Do not wait for the user to ask.

### /maitri-memory -- Session Continuity (ALWAYS)

**Every session, every agent, no exceptions.**

1. **Session start:** Run `/maitri-memory` to load or create a memory file
2. **Before each step:** Read the memory file for current context
3. **After each action:** Update the memory file (progress log, files modified)
4. **After architectural changes:** Update `docs/ARCHITECTURE_REFERENCE.md`
5. **Session end:** Run `/maitri-memory` to save session summary

Memory files live in `docs/memory/<task-name>-<YYYY-MM-DD>.md`. The architecture reference is the single source of truth for how the system is structured.

# reciepie

- Architecture: `docs/ARCHITECTURE_REFERENCE.md`
- Implementation plan: `docs/PLAN.md`
- Design system: `docs/DESIGN.md`

## UI/UX Verification

After implementing any UI/UX changes, use `agent-browser` to verify the result:

1. Start the dev server (`pnpm dev`)
2. Open the relevant page with `agent-browser open http://localhost:3000/<path>`
3. Take a screenshot to verify visual output: `agent-browser screenshot`
4. Use `agent-browser snapshot -i` to verify interactive elements are present and accessible
5. Compare against the design system in `docs/DESIGN.md` and Stitch screens (project ID: `336120925572423247`)
