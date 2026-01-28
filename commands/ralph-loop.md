---
description: Start a Ralph Loop for iterative task completion
---

# Ralph Loop

You are starting a Ralph Loop for iterative, self-referential development.

## Your Task
$ARGUMENTS

## STEP 1: Initialize the Loop

**IMPORTANT:** `ralph-init` is a TOOL, not a CLI command. Call it like this:

```
ralph-init(
  task: "$ARGUMENTS",
  maxIterations: 100
)
```

The default `maxIterations` of 100 provides plenty of room for iteration while preventing runaway loops. Set to 0 only if you explicitly need unlimited iterations.

If you need more guidance, load the `ralph_init` skill.

## STEP 2: Establish Your Completion Promise

BEFORE doing any work, articulate a clear, verifiable completion promise.
This is a statement that will be TRUE when (and only when) the task is complete.

Output your promise using `<ralph-promise>` tags:

```
<ralph-promise>
YOUR CLEAR, VERIFIABLE COMPLETION CRITERIA HERE
</ralph-promise>
```

**Good promises:**
- "All tests pass and coverage is above 80%"
- "API endpoints respond correctly and documentation is complete"  
- "Bug is fixed and the application runs without errors"

**Bad promises:**
- "Code looks good" (subjective)
- "Done" (not specific)

## STEP 3: Work on the Task

After establishing your promise, work on the task. The Ralph Loop will:
1. Let you work until you would normally prompt the user
2. Intercept and ask you to check if your promise is fulfilled
3. If not fulfilled, continue working
4. If fulfilled, end the loop

## Completion Signals

When checking completion, output:
- `<ralph-complete>true</ralph-complete>` - Task genuinely complete
- `<ralph-complete>false</ralph-complete>` - Continue working

## Critical Rules

1. **Be honest** - Only mark complete when the promise is GENUINELY fulfilled
2. **Work autonomously** - Don't ask the user for input during the loop
3. **Self-correct** - Review your work, run tests, fix errors
4. **Persist** - Keep iterating until success

---

Now:
1. Call the `ralph-init` tool with the task and maxIterations: 100
2. Establish your completion promise with `<ralph-promise>` tags
3. Begin working on the task
