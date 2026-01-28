---
name: ralph-loop
description: Guidance for working within a Ralph Loop - iterative self-referential development methodology
---

# Ralph Loop Skill

This skill provides guidance for working effectively within a Ralph Loop.

## What is a Ralph Loop?

A Ralph Loop is a development methodology where you work iteratively on a task until a clear completion promise is fulfilled. Named after Ralph Wiggum, it embodies persistent iteration despite setbacks.

## Core Principles

### 1. Establish a Clear Promise First
Before any work, articulate what "done" looks like:
```
<ralph-promise>
Specific, verifiable criteria that will be TRUE when complete
</ralph-promise>
```

### 2. Work Autonomously
- Don't ask for user input during the loop
- Make decisions independently
- Use your judgment to resolve ambiguities

### 3. Self-Correct Through Iteration
- Review your previous work
- Check git history and file changes
- Run tests and fix failures
- Learn from errors

### 4. Be Honest About Completion
Only output `<ralph-complete>true</ralph-complete>` when:
- ALL criteria in your promise are met
- You can verify this through tests, inspection, or demonstration
- You would stake your reputation on it being complete

## Available Tools

The Ralph Loop plugin provides these TOOLS (not CLI commands):
- `ralph-init` - Initialize a new Ralph Loop (call as a tool, not CLI)
- `ralph-promise` - Set the completion promise
- `ralph-complete` - Signal completion status
- `ralph-status` - Check loop status
- `ralph-cancel` - Cancel the active loop

**Note:** These are OpenCode tools, not CLI commands. Call them like:
```
ralph-init(task: "...", maxIterations: 100)
```

For detailed initialization guidance, load the `ralph_init` skill.

## Checking Completion

When prompted to check completion:

1. **Review the promise** - What did you commit to?
2. **Verify each criterion** - Check tests, run the code, inspect files
3. **Be honest** - If ANY criterion isn't met, continue working
4. **Signal appropriately**:
   - `<ralph-complete>true</ralph-complete>` - Genuinely done
   - `<ralph-complete>false</ralph-complete>` - Continue working

## Anti-Patterns to Avoid

1. **Premature completion** - Claiming done when tests still fail
2. **Scope creep escape** - Redefining the promise to be easier
3. **Learned helplessness** - Giving up and asking user for help
4. **Infinite loops** - Not making progress toward completion
5. **Dishonest signaling** - Lying about completion to exit

## Iteration Strategy

Each iteration should:
1. Assess current state vs completion promise
2. Identify the most impactful next step
3. Execute that step
4. Verify progress was made
5. Document any blockers

## When Stuck

If progress stalls:
1. Re-read the original task and promise
2. Check what's actually blocking completion
3. Try a different approach
4. Consider breaking the problem down further
5. Review error messages and test outputs carefully

Remember: The loop is designed to continue until genuine completion. Trust the process and keep iterating.
