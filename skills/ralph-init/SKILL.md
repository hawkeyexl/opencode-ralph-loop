---
name: ralph-init
description: Initialize a Ralph Loop for iterative autonomous task completion - use this when starting a Ralph Loop
---

# Ralph Init Skill

This skill guides you through initializing a Ralph Loop for iterative, autonomous task completion.

## Overview

A Ralph Loop is a development methodology where you work iteratively on a task until a clear completion promise is fulfilled. The loop continues autonomously, checking completion at each iteration.

## Initialization Steps

### Step 1: Call the ralph-init Tool

Use the `ralph-init` tool (NOT a CLI command) with these parameters:

```
ralph-init(
  task: "YOUR TASK DESCRIPTION",
  maxIterations: 100
)
```

**Important defaults:**
- `maxIterations`: Set to **100** by default. This provides plenty of room for iteration while preventing infinite loops.
- Set to 0 only if you explicitly need unlimited iterations.

### Step 2: Articulate Your Completion Promise

After initialization, you MUST articulate a clear, verifiable completion promise. Output it using:

```
<ralph-promise>
YOUR CLEAR, VERIFIABLE COMPLETION CRITERIA HERE
</ralph-promise>
```

**Good promises are:**
- Specific and measurable
- Verifiable through tests, inspection, or demonstration
- Unambiguous about what "done" means

**Examples of good promises:**
- "All tests pass with >80% coverage"
- "API endpoints return correct responses for all CRUD operations"
- "The bug is fixed and the application runs without errors"
- "Feature X is implemented with documentation and tests"

**Examples of bad promises:**
- "Code looks good" (subjective)
- "Done" (not specific)
- "Most features work" (incomplete criteria)

### Step 3: Begin Working

Once the promise is established:
1. Work on the task autonomously
2. Don't ask the user for input during the loop
3. The loop will check completion when you would normally prompt the user
4. Continue until your promise is genuinely fulfilled

## Completion Signals

When the loop checks completion, signal your status:

- `<ralph-complete>true</ralph-complete>` - Promise is genuinely fulfilled
- `<ralph-complete>false</ralph-complete>` - Continue working

**Only signal true when:**
- ALL criteria in your promise are met
- You can verify this through tests, inspection, or demonstration
- You would stake your reputation on it being complete

## Quick Reference

```
1. ralph-init(task: "...", maxIterations: 100)
2. <ralph-promise>Verifiable criteria</ralph-promise>
3. Work autonomously
4. <ralph-complete>true|false</ralph-complete> when checked
```

## Related Tools

- `ralph-status` - Check current loop status
- `ralph-cancel` - Cancel the active loop
- `ralph-promise` - Update the completion promise
- `ralph-complete` - Signal completion status

## Troubleshooting

**"ralph-init command not found"**
- `ralph-init` is a TOOL, not a CLI command
- Call it as: `ralph-init(task: "...", maxIterations: 100)`

**"No active Ralph Loop"**
- Run the initialization step first
- Check status with `ralph-status`

**Loop not intercepting**
- Ensure you've established a promise with `<ralph-promise>` tags
- The loop only activates after the promise is established
