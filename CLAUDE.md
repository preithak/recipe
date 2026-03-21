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
