# Ralph Loop Plugin for OpenCode

An adaptation of [Claude Code's ralph-wiggum plugin](https://github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum) for OpenCode.

## What is a Ralph Loop?

Ralph is a development methodology based on continuous AI agent loops. Named after Ralph Wiggum from The Simpsons, it embodies the philosophy of persistent iteration despite setbacks.

The technique was pioneered by Geoffrey Huntley: **"Ralph is a Bash loop"** - a simple `while true` that repeatedly feeds an AI agent a prompt, allowing it to iteratively improve its work until completion.

## Key Adaptation for OpenCode

Claude Code uses a **Stop hook** to intercept when the agent tries to exit and feed the same prompt back. OpenCode doesn't have an equivalent Stop hook.

This plugin adapts the concept using OpenCode's **session.idle** event:

1. **User runs `/ralph-loop`** with a task description
2. **Agent articulates a completion promise** - a clear, verifiable statement of what "done" looks like
3. **When session goes idle** (agent would normally prompt user), the plugin intercepts
4. **Plugin injects a completion check** - asking the agent to verify if the promise is fulfilled
5. **If incomplete**, agent continues working autonomously
6. **If complete**, loop ends and control returns to user

## Installation

### From Local Files

1. Copy this directory to your OpenCode plugins folder:
   ```bash
   cp -r opencode-ralph-loop ~/.config/opencode/plugins/
   ```

2. Or for project-local installation:
   ```bash
   cp -r opencode-ralph-loop .opencode/plugins/
   ```

### From GitHub (clone + symlink)

If you prefer to develop locally or keep the plugin in a separate repo, clone it and create a symlink into your OpenCode plugins directory. This keeps the plugin working while you edit source files.

1. Clone the repository (choose a location you control):
```bash
git clone https://github.com/hawkeyexl/opencode-ralph-loop.git ~/src/opencode-ralph-loop
cd ~/src/opencode-ralph-loop
```

2. Ensure the OpenCode plugins directory exists and remove any existing plugin directory first:
```bash
mkdir -p ~/.config/opencode/plugins
rm -rf ~/.config/opencode/plugins/opencode-ralph-loop
```

3. Create the symlink (use absolute paths):
```bash
ln -s "$PWD" ~/.config/opencode/plugins/opencode-ralph-loop
```

4. Verify the symlink points to your repo:
```bash
ls -l ~/.config/opencode/plugins/opencode-ralph-loop
# -> should show a symbolic link to your cloned path
```

Notes:
- Use `sudo` only if the target directory is owned by root (rare for `~/.config`).
- If you want a project-local plugin, symlink into `.opencode/plugins/` from your project root instead.
- To update the plugin, `cd` into your clone and use `git pull` — no extra copy step required.

## Usage

### Start a Ralph Loop

```
/ralph-loop Build a REST API for todos with CRUD operations, validation, and tests
```

The agent will:
1. Articulate a completion promise (e.g., "All CRUD endpoints working with tests passing")
2. Work on the task iteratively
3. Self-check completion at each iteration
4. Continue until the promise is genuinely fulfilled

### Check Status

```
/ralph-status
```

Shows the current loop state, iteration count, and completion promise.

### Cancel a Loop

```
/cancel-ralph
```

Stops the active loop immediately.

## How It Differs from Claude Code

| Aspect | Claude Code | OpenCode |
|--------|-------------|----------|
| **Hook mechanism** | Stop hook (blocks exit) | session.idle event (intercepts before prompt) |
| **Promise source** | User provides via `--completion-promise` | Agent articulates based on task |
| **Loop control** | External bash state file | JSON state in `.opencode/` |
| **Continuation** | Same prompt fed back | Completion check injected |

## Completion Promise

The key innovation of this adaptation is **agent-articulated promises**. Instead of the user specifying when the task is done, the agent must:

1. Understand the task requirements
2. Articulate clear, verifiable completion criteria
3. Work toward fulfilling those criteria
4. Honestly assess when they're met

This creates better alignment between the task and its completion criteria.

### Good Promises
- "All tests pass and coverage is above 80%"
- "API endpoints respond correctly and documentation is complete"
- "Bug is fixed and application runs without errors"

### Bad Promises
- "Code looks good" (subjective)
- "Done" (not specific)
- "Most features work" (incomplete)

## State Management

The plugin maintains state in `.opencode/ralph-loop.state.json`:

```json
{
  "active": true,
  "iteration": 5,
  "maxIterations": 100,
  "startedAt": "2024-01-15T10:30:00Z",
  "originalTask": "Build a REST API...",
  "completionPromise": "All CRUD endpoints working with tests passing",
  "promiseEstablished": true,
  "lastCheckedAt": "2024-01-15T10:45:00Z"
}
```

**Default max iterations:** 100 (prevents runaway loops while allowing substantial iteration)

## Philosophy

### Iteration > Perfection
Don't aim for perfect on first try. Let the loop refine the work.

### Failures Are Data
Each failed iteration provides information for the next attempt.

### Persistence Wins
Keep trying until success. The loop handles retry logic automatically.

### Honesty Required
Only signal completion when the promise is genuinely fulfilled. The loop is designed to continue until truth, not escape.

## When to Use Ralph Loops

**Good for:**
- Well-defined tasks with clear success criteria
- Tasks requiring iteration (getting tests to pass)
- Greenfield development where you can walk away
- Tasks with automatic verification

**Not good for:**
- Tasks requiring human judgment
- One-shot operations
- Unclear success criteria
- Production debugging

## Credits

- Original Ralph Wiggum technique: [Geoffrey Huntley](https://ghuntley.com/ralph/)
- Claude Code plugin: [Anthropic](https://github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum)

## License

MIT
